#!/bin/bash

# Kubernetes Pod 备份脚本
# 用于备份指定 Pod 资源的元数据和相关信息

set -e

# 脚本配置
BACKUP_DIR="${BACKUP_DIR:-/tmp/k8s-backup}"
TIMESTAMP=$(date +"%Y%m%d%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/pod-backup-${TIMESTAMP}.yaml"

# 颜色输出函数
print_info() {
    echo -e "\033[0;34m[INFO]\033[0m $1"
}

print_success() {
    echo -e "\033[0;32m[SUCCESS]\033[0m $1"
}

print_error() {
    echo -e "\033[0;31m[ERROR]\033[0m $1"
    exit 1
}

# 检查命令是否可用
check_command() {
    if ! command -v "$1" &> /dev/null; then
        print_error "命令 '$1' 不可用"
    fi
}

# 检查 Kubernetes 连接
check_kubernetes_connection() {
    print_info "检查 Kubernetes 连接..."
    if ! kubectl cluster-info &> /dev/null; then
        print_error "无法连接到 Kubernetes 集群"
    fi
    print_success "Kubernetes 连接正常"
}

# 备份 Pod 资源
backup_pod() {
    local pod_name="$1"
    local namespace="${2:-default}"
    
    print_info "备份 Pod $pod_name 到 $BACKUP_FILE"
    
    # 创建备份目录
    mkdir -p "$BACKUP_DIR"
    
    # 备份 Pod 资源
    kubectl get pod "$pod_name" -n "$namespace" -o yaml > "$BACKUP_FILE" || print_error "无法备份 Pod $pod_name"
    
    # 备份相关资源（ConfigMap, Secret, Service, Ingress）
    print_info "备份相关资源..."
    
    # 获取 Pod 标签
    local app_label=$(kubectl get pod "$pod_name" -n "$namespace" -o jsonpath='{.metadata.labels.app}')
    local name_label=$(kubectl get pod "$pod_name" -n "$namespace" -o jsonpath='{.metadata.labels.name}')
    
    # 备份 ConfigMap
    if [ -n "$app_label" ]; then
        kubectl get configmap -n "$namespace" -l app="$app_label" -o yaml >> "$BACKUP_FILE" 2>/dev/null || true
    fi
    if [ -n "$name_label" ]; then
        kubectl get configmap -n "$namespace" -l name="$name_label" -o yaml >> "$BACKUP_FILE" 2>/dev/null || true
    fi
    
    # 备份 Secret
    if [ -n "$app_label" ]; then
        kubectl get secret -n "$namespace" -l app="$app_label" -o yaml >> "$BACKUP_FILE" 2>/dev/null || true
    fi
    if [ -n "$name_label" ]; then
        kubectl get secret -n "$namespace" -l name="$name_label" -o yaml >> "$BACKUP_FILE" 2>/dev/null || true
    fi
    
    # 备份 Service
    if [ -n "$app_label" ]; then
        kubectl get service -n "$namespace" -l app="$app_label" -o yaml >> "$BACKUP_FILE" 2>/dev/null || true
    fi
    if [ -n "$name_label" ]; then
        kubectl get service -n "$namespace" -l name="$name_label" -o yaml >> "$BACKUP_FILE" 2>/dev/null || true
    fi
    
    # 备份 Ingress
    if [ -n "$app_label" ]; then
        kubectl get ingress -n "$namespace" -l app="$app_label" -o yaml >> "$BACKUP_FILE" 2>/dev/null || true
    fi
    if [ -n "$name_label" ]; then
        kubectl get ingress -n "$namespace" -l name="$name_label" -o yaml >> "$BACKUP_FILE" 2>/dev/null || true
    fi
    
    print_success "Pod $pod_name 备份完成"
}

# 显示帮助信息
show_help() {
    cat << EOF
Kubernetes Pod 备份脚本

用法: $0 [选项] <Pod 名称> [命名空间]

选项:
  -h, --help                显示帮助信息
  -d, --dir <目录>          指定备份目录（默认: /tmp/k8s-backup）
  -l, --list                列出所有 Pod
  -a, --all                 备份所有 Pod
  -v, --verbose             显示详细信息
  -c, --check               检查备份文件完整性

参数:
  <Pod 名称>                要备份的 Pod 名称
  [命名空间]                可选，Pod 所在的命名空间（默认: default）

示例:
  $0 my-pod my-namespace
  $0 -d /backups my-pod my-namespace
  $0 -l
  $0 -a
EOF
}

# 列出所有 Pod
list_pods() {
    print_info "列出所有 Pod"
    kubectl get pods --all-namespaces
}

# 备份所有 Pod
backup_all_pods() {
    local namespaces=$(kubectl get namespaces -o jsonpath='{.items[*].metadata.name}')
    
    for namespace in $namespaces; do
        print_info "备份命名空间 $namespace 中的 Pod..."
        
        local pods=$(kubectl get pods -n "$namespace" -o jsonpath='{.items[*].metadata.name}')
        
        for pod in $pods; do
            # 跳过系统 Pod 和临时 Pod
            if [[ "$pod" == *"kube-"* || "$pod" == *"coredns"* || "$pod" == *"etcd-"* ]]; then
                print_info "跳过系统 Pod $pod"
                continue
            fi
            
            # 创建备份文件
            local pod_backup_file="${BACKUP_DIR}/pod-${namespace}-${pod}-${TIMESTAMP}.yaml"
            print_info "备份 Pod $pod 到 $pod_backup_file"
            
            kubectl get pod "$pod" -n "$namespace" -o yaml > "$pod_backup_file" || {
                print_error "无法备份 Pod $pod 在命名空间 $namespace 中"
                continue
            }
        done
    done
    
    print_success "所有 Pod 备份完成"
}

# 检查备份文件完整性
check_backup() {
    local backup_file="$1"
    
    if [ ! -f "$backup_file" ]; then
        print_error "备份文件 $backup_file 不存在"
    fi
    
    print_info "检查备份文件 $backup_file..."
    
    if ! yaml2json < "$backup_file" &> /dev/null; then
        print_error "备份文件 $backup_file 格式无效"
    fi
    
    print_success "备份文件 $backup_file 格式有效"
}

# 主函数
main() {
    # 解析命令行参数
    while [[ $# -gt 0 ]]; do
        case "$1" in
            -h|--help)
                show_help
                exit 0
                ;;
            -d|--dir)
                if [ -n "$2" ]; then
                    BACKUP_DIR="$2"
                    shift 2
                else
                    print_error "选项 $1 需要参数"
                fi
                ;;
            -l|--list)
                list_pods
                exit 0
                ;;
            -a|--all)
                check_command "kubectl"
                check_kubernetes_connection
                backup_all_pods
                exit 0
                ;;
            -v|--verbose)
                set -x
                shift 1
                ;;
            -c|--check)
                if [ -n "$2" ]; then
                    check_command "yaml2json"
                    check_backup "$2"
                    exit 0
                else
                    print_error "选项 $1 需要参数"
                fi
                ;;
            *)
                # 剩下的参数视为 Pod 名称和命名空间
                POD_NAME="$1"
                if [ -n "$2" ]; then
                    NAMESPACE="$2"
                    shift 2
                else
                    NAMESPACE="default"
                    shift 1
                fi
                ;;
        esac
    done
    
    # 检查必填参数
    if [ -z "$POD_NAME" ]; then
        print_error "请指定要备份的 Pod 名称"
        show_help
        exit 1
    fi
    
    # 检查命令是否可用
    check_command "kubectl"
    
    # 检查 Kubernetes 连接
    check_kubernetes_connection
    
    # 备份 Pod
    backup_pod "$POD_NAME" "$NAMESPACE"
}

# 执行主函数
main "$@"
