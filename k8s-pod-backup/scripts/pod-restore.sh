#!/bin/bash

# Kubernetes Pod 恢复脚本
# 用于从备份中恢复 Pod 资源

set -e

# 脚本配置
RESTORE_DIR="${RESTORE_DIR:-/tmp/k8s-backup}"
TIMESTAMP=$(date +"%Y%m%d%H%M%S")

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

# 恢复 Pod 资源
restore_pod() {
    local backup_file="$1"
    local namespace="${2:-default}"
    
    print_info "从 $backup_file 恢复 Pod 资源到命名空间 $namespace"
    
    # 检查备份文件是否存在
    if [ ! -f "$backup_file" ]; then
        print_error "备份文件 $backup_file 不存在"
    fi
    
    # 检查备份文件格式
    if ! yaml2json < "$backup_file" &> /dev/null; then
        print_error "备份文件 $backup_file 格式无效"
    fi
    
    # 恢复 Pod 资源
    # 使用 grep 查找 Pod 资源定义
    local pod_manifest=$(grep -A 100 "apiVersion: v1" "$backup_file" | grep -B 100 -A 100 "kind: Pod")
    
    if [ -z "$pod_manifest" ]; then
        print_error "备份文件 $backup_file 中没有找到 Pod 资源定义"
    fi
    
    # 创建临时文件存储 Pod 资源定义
    local temp_file=$(mktemp /tmp/pod-restore.XXXXXXXX.yaml)
    echo "$pod_manifest" > "$temp_file"
    
    # 恢复 Pod 资源
    kubectl apply -f "$temp_file" -n "$namespace" || print_error "无法恢复 Pod 资源"
    
    # 获取 Pod 名称
    local pod_name=$(grep -A 10 "metadata:" "$temp_file" | grep -A 10 "name:" | head -1 | awk '{print $2}')
    pod_name=${pod_name%,}
    
    # 等待 Pod 运行
    print_info "等待 Pod $pod_name 运行..."
    kubectl wait pod "$pod_name" -n "$namespace" --for=condition=ready --timeout=300s || {
        print_error "Pod $pod_name 在 5 分钟内未准备好"
        kubectl describe pod "$pod_name" -n "$namespace"
    }
    
    # 清理临时文件
    rm "$temp_file"
    
    print_success "Pod $pod_name 恢复成功"
}

# 显示帮助信息
show_help() {
    cat << EOF
Kubernetes Pod 恢复脚本

用法: $0 [选项] <备份文件路径> [命名空间]

选项:
  -h, --help                显示帮助信息
  -d, --dir <目录>          指定备份目录（默认: /tmp/k8s-backup）
  -l, --list                列出备份文件
  -v, --verbose             显示详细信息
  -c, --check               检查备份文件完整性
  -f, --force               强制恢复（删除已存在的 Pod）
  -r, --replace             替换已存在的 Pod

参数:
  <备份文件路径>            要用于恢复的备份文件
  [命名空间]                可选，Pod 所在的命名空间（默认: default）

示例:
  $0 pod-backup-20231230120000.yaml my-namespace
  $0 -d /backups pod-backup-20231230120000.yaml my-namespace
  $0 -l
  $0 -c pod-backup-20231230120000.yaml
EOF
}

# 列出备份文件
list_backups() {
    print_info "列出备份文件"
    
    if [ ! -d "$RESTORE_DIR" ]; then
        print_error "备份目录 $RESTORE_DIR 不存在"
    fi
    
    ls -la "$RESTORE_DIR" | grep -E "(pod-backup|pod-.*\.yaml)"
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
    
    # 检查是否包含 Pod 资源定义
    if ! grep -q "kind: Pod" "$backup_file"; then
        print_error "备份文件 $backup_file 中没有找到 Pod 资源定义"
    fi
    
    print_success "备份文件 $backup_file 格式有效且包含 Pod 资源定义"
}

# 强制恢复 Pod
force_restore_pod() {
    local backup_file="$1"
    local namespace="${2:-default}"
    
    print_info "强制恢复 Pod 资源"
    
    # 获取 Pod 名称
    local pod_name=$(grep -A 10 "metadata:" "$backup_file" | grep -A 10 "name:" | head -1 | awk '{print $2}')
    pod_name=${pod_name%,}
    
    # 删除已存在的 Pod
    if kubectl get pod "$pod_name" -n "$namespace" &> /dev/null; then
        print_info "删除已存在的 Pod $pod_name..."
        kubectl delete pod "$pod_name" -n "$namespace" --grace-period=0 --force 2>/dev/null || true
        sleep 5
    fi
    
    # 恢复 Pod
    restore_pod "$backup_file" "$namespace"
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
                    RESTORE_DIR="$2"
                    shift 2
                else
                    print_error "选项 $1 需要参数"
                fi
                ;;
            -l|--list)
                list_backups
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
            -f|--force)
                FORCE_RESTORE=true
                shift 1
                ;;
            -r|--replace)
                REPLACE_POD=true
                shift 1
                ;;
            *)
                # 剩下的参数视为备份文件和命名空间
                BACKUP_FILE="$1"
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
    if [ -z "$BACKUP_FILE" ]; then
        print_error "请指定要恢复的备份文件"
        show_help
        exit 1
    fi
    
    # 检查命令是否可用
    check_command "kubectl"
    check_command "yaml2json"
    
    # 检查 Kubernetes 连接
    check_kubernetes_connection
    
    # 执行恢复
    if [ "$FORCE_RESTORE" = true ]; then
        force_restore_pod "$BACKUP_FILE" "$NAMESPACE"
    else
        restore_pod "$BACKUP_FILE" "$NAMESPACE"
    fi
}

# 执行主函数
main "$@"
