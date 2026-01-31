#!/bin/bash

# Kubernetes Pod 对比脚本
# 用于比较两个 Pod 资源的差异

set -e

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

print_diff() {
    echo -e "\033[0;33m[DIFF]\033[0m $1"
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

# 比较两个 Pod 资源的差异
compare_pods() {
    local pod1="$1"
    local namespace1="${2:-default}"
    local pod2="$3"
    local namespace2="${4:-default}"
    
    print_info "比较 Pod $pod1 (命名空间: $namespace1) 和 Pod $pod2 (命名空间: $namespace2)"
    
    # 获取 Pod 资源定义
    local pod1_manifest=$(kubectl get pod "$pod1" -n "$namespace1" -o yaml 2>/dev/null || print_error "无法获取 Pod $pod1")
    local pod2_manifest=$(kubectl get pod "$pod2" -n "$namespace2" -o yaml 2>/dev/null || print_error "无法获取 Pod $pod2")
    
    # 创建临时文件存储资源定义
    local temp_file1=$(mktemp /tmp/pod-compare-1.XXXXXXXX.yaml)
    local temp_file2=$(mktemp /tmp/pod-compare-2.XXXXXXXX.yaml)
    
    echo "$pod1_manifest" > "$temp_file1"
    echo "$pod2_manifest" > "$temp_file2"
    
    # 过滤掉不需要比较的字段
    for temp_file in "$temp_file1" "$temp_file2"; do
        # 删除 resourceVersion 和 selfLink 字段（这些字段会在每次创建时变化）
        sed -i '/resourceVersion:/d' "$temp_file"
        sed -i '/selfLink:/d' "$temp_file"
        sed -i '/uid:/d' "$temp_file"
        sed -i '/creationTimestamp:/d' "$temp_file"
        sed -i '/clusterIP:/d' "$temp_file"
        
        # 删除状态字段（这些字段会在运行时变化）
        sed -i '/status:/,/^---/d' "$temp_file"
        sed -i '/status:/,/^$/d' "$temp_file"
        
        # 删除空行
        sed -i '/^$/d' "$temp_file"
    done
    
    # 使用 diff 命令比较
    local diff_output=$(diff "$temp_file1" "$temp_file2" 2>&1 || true)
    
    if [ -z "$diff_output" ]; then
        print_success "Pod $pod1 和 Pod $pod2 完全相同"
    else
        print_info "Pod $pod1 和 Pod $pod2 的差异:"
        while IFS= read -r line; do
            if [[ "$line" == ">"* ]]; then
                echo -e "\033[0;32m${line}\033[0m"
            elif [[ "$line" == "<"* ]]; then
                echo -e "\033[0;31m${line}\033[0m"
            else
                echo "$line"
            fi
        done <<< "$diff_output"
    fi
    
    # 清理临时文件
    rm "$temp_file1" "$temp_file2"
}

# 比较 Pod 和备份文件的差异
compare_pod_with_backup() {
    local pod_name="$1"
    local namespace="${2:-default}"
    local backup_file="$3"
    
    print_info "比较 Pod $pod_name (命名空间: $namespace) 和备份文件 $backup_file"
    
    # 检查备份文件是否存在
    if [ ! -f "$backup_file" ]; then
        print_error "备份文件 $backup_file 不存在"
    fi
    
    # 获取 Pod 资源定义
    local pod_manifest=$(kubectl get pod "$pod_name" -n "$namespace" -o yaml 2>/dev/null || print_error "无法获取 Pod $pod_name")
    
    # 创建临时文件存储资源定义
    local temp_file=$(mktemp /tmp/pod-compare.XXXXXXXX.yaml)
    echo "$pod_manifest" > "$temp_file"
    
    # 过滤掉不需要比较的字段（与上面相同）
    sed -i '/resourceVersion:/d' "$temp_file"
    sed -i '/selfLink:/d' "$temp_file"
    sed -i '/uid:/d' "$temp_file"
    sed -i '/creationTimestamp:/d' "$temp_file"
    sed -i '/clusterIP:/d' "$temp_file"
    sed -i '/status:/,/^---/d' "$temp_file"
    sed -i '/status:/,/^$/d' "$temp_file"
    sed -i '/^$/d' "$temp_file"
    
    # 从备份文件中提取 Pod 资源定义
    local backup_manifest=$(grep -A 100 "apiVersion: v1" "$backup_file" | grep -B 100 -A 100 "kind: Pod" 2>/dev/null || print_error "备份文件中没有找到 Pod 资源定义")
    
    # 创建临时文件存储备份内容
    local backup_temp_file=$(mktemp /tmp/pod-compare-backup.XXXXXXXX.yaml)
    echo "$backup_manifest" > "$backup_temp_file"
    
    # 过滤掉备份文件中不需要比较的字段
    sed -i '/resourceVersion:/d' "$backup_temp_file"
    sed -i '/selfLink:/d' "$backup_temp_file"
    sed -i '/uid:/d' "$backup_temp_file"
    sed -i '/creationTimestamp:/d' "$backup_temp_file"
    sed -i '/clusterIP:/d' "$backup_temp_file"
    sed -i '/status:/,/^---/d' "$backup_temp_file"
    sed -i '/status:/,/^$/d' "$backup_temp_file"
    sed -i '/^$/d' "$backup_temp_file"
    
    # 使用 diff 命令比较
    local diff_output=$(diff "$temp_file" "$backup_temp_file" 2>&1 || true)
    
    if [ -z "$diff_output" ]; then
        print_success "Pod $pod_name 和备份文件 $backup_file 完全相同"
    else
        print_info "Pod $pod_name 和备份文件 $backup_file 的差异:"
        while IFS= read -r line; do
            if [[ "$line" == ">"* ]]; then
                echo -e "\033[0;32m${line}\033[0m"
            elif [[ "$line" == "<"* ]]; then
                echo -e "\033[0;31m${line}\033[0m"
            else
                echo "$line"
            fi
        done <<< "$diff_output"
    fi
    
    # 清理临时文件
    rm "$temp_file" "$backup_temp_file"
}

# 显示帮助信息
show_help() {
    cat << EOF
Kubernetes Pod 对比脚本

用法: $0 [选项] <Pod1> [命名空间1] <Pod2> [命名空间2]
   或: $0 [选项] <Pod> [命名空间] <备份文件路径>

选项:
  -h, --help                显示帮助信息
  -v, --verbose             显示详细信息
  -b, --brief               显示简洁的差异
  -s, --save                保存比较结果到文件

参数:
  <Pod1>                    要比较的第一个 Pod 名称
  [命名空间1]                可选，第一个 Pod 所在的命名空间（默认: default）
  <Pod2>                    要比较的第二个 Pod 名称
  [命名空间2]                可选，第二个 Pod 所在的命名空间（默认: default）

  或
  
  <Pod>                     要比较的 Pod 名称
  [命名空间]                可选，Pod 所在的命名空间（默认: default）
  <备份文件路径>            要比较的备份文件路径

示例:
  $0 my-pod my-namespace other-pod other-namespace
  $0 my-pod my-namespace /backups/pod-backup-20231230120000.yaml
  $0 -b my-pod my-pod-backup.yaml
  $0 -s my-pod my-pod-backup.yaml
EOF
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
            -v|--verbose)
                set -x
                shift 1
                ;;
            -b|--brief)
                BRIEF=true
                shift 1
                ;;
            -s|--save)
                SAVE=true
                shift 1
                ;;
            *)
                # 剩下的参数视为比较对象
                if [ -z "$ARG1" ]; then
                    ARG1="$1"
                    shift 1
                elif [ -z "$ARG2" ]; then
                    ARG2="$1"
                    shift 1
                elif [ -z "$ARG3" ]; then
                    ARG3="$1"
                    shift 1
                elif [ -z "$ARG4" ]; then
                    ARG4="$1"
                    shift 1
                fi
                ;;
        esac
    done
    
    # 检查参数数量
    if [ -z "$ARG1" ] || [ -z "$ARG2" ]; then
        print_error "请指定至少两个比较对象"
        show_help
        exit 1
    fi
    
    # 检查命令是否可用
    check_command "kubectl"
    
    # 检查 Kubernetes 连接（如果涉及到 Kubernetes Pod）
    if [ -f "$ARG1" ] || [ -f "$ARG2" ] || [ -f "$ARG3" ] || [ -f "$ARG4" ]; then
        # 如果参数包含文件，可能需要检查 Kubernetes 连接
        check_kubernetes_connection
    else
        check_kubernetes_connection
    fi
    
    # 确定比较类型
    if [ -f "$ARG2" ]; then
        # 比较 Pod 和备份文件
        compare_pod_with_backup "$ARG1" "$ARG3" "$ARG2"
    elif [ -f "$ARG1" ]; then
        # 比较两个备份文件
        print_info "比较两个备份文件 $ARG1 和 $ARG2"
        
        if [ ! -f "$ARG1" ]; then
            print_error "文件 $ARG1 不存在"
        fi
        
        if [ ! -f "$ARG2" ]; then
            print_error "文件 $ARG2 不存在"
        fi
        
        # 从备份文件中提取 Pod 资源定义
        local backup1_manifest=$(grep -A 100 "apiVersion: v1" "$ARG1" | grep -B 100 -A 100 "kind: Pod" 2>/dev/null || print_error "备份文件 $ARG1 中没有找到 Pod 资源定义")
        local backup2_manifest=$(grep -A 100 "apiVersion: v1" "$ARG2" | grep -B 100 -A 100 "kind: Pod" 2>/dev/null || print_error "备份文件 $ARG2 中没有找到 Pod 资源定义")
        
        # 创建临时文件存储备份内容
        local temp_file1=$(mktemp /tmp/pod-compare-1.XXXXXXXX.yaml)
        local temp_file2=$(mktemp /tmp/pod-compare-2.XXXXXXXX.yaml)
        
        echo "$backup1_manifest" > "$temp_file1"
        echo "$backup2_manifest" > "$temp_file2"
        
        # 过滤掉不需要比较的字段
        for temp_file in "$temp_file1" "$temp_file2"; do
            sed -i '/resourceVersion:/d' "$temp_file"
            sed -i '/selfLink:/d' "$temp_file"
            sed -i '/uid:/d' "$temp_file"
            sed -i '/creationTimestamp:/d' "$temp_file"
            sed -i '/clusterIP:/d' "$temp_file"
            sed -i '/status:/,/^---/d' "$temp_file"
            sed -i '/status:/,/^$/d' "$temp_file"
            sed -i '/^$/d' "$temp_file"
        done
        
        # 使用 diff 命令比较
        local diff_output=$(diff "$temp_file1" "$temp_file2" 2>&1 || true)
        
        if [ -z "$diff_output" ]; then
            print_success "备份文件 $ARG1 和 $ARG2 完全相同"
        else
            print_info "备份文件 $ARG1 和 $ARG2 的差异:"
            while IFS= read -r line; do
                if [[ "$line" == ">"* ]]; then
                    echo -e "\033[0;32m${line}\033[0m"
                elif [[ "$line" == "<"* ]]; then
                    echo -e "\033[0;31m${line}\033[0m"
                else
                    echo "$line"
                fi
            done <<< "$diff_output"
        fi
        
        # 清理临时文件
        rm "$temp_file1" "$temp_file2"
    else
        # 比较两个 Kubernetes Pod
        compare_pods "$ARG1" "$ARG2" "$ARG3" "$ARG4"
    fi
}

# 执行主函数
main "$@"
