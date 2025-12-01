#!/bin/bash

# 新能源汽车情报系统启动脚本
# 创建时间: 2025年11月28日

set -e

echo "🚀 新能源汽车情报系统启动脚本"
echo "=================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 函数定义
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查Node.js版本
check_node_version() {
    log_info "检查Node.js版本..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version | cut -d'v' -f2)
        MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1)
        
        if [ "$MAJOR_VERSION" -ge 16 ]; then
            log_success "Node.js版本符合要求: v$NODE_VERSION"
        else
            log_error "Node.js版本过低，需要v16.0.0或更高版本"
            exit 1
        fi
    else
        log_error "未安装Node.js，请先安装Node.js v16.0.0或更高版本"
        exit 1
    fi
}

# 检查npm版本
check_npm_version() {
    log_info "检查npm版本..."
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        log_success "npm版本: v$NPM_VERSION"
    else
        log_error "未安装npm"
        exit 1
    fi
}

# 安装依赖
install_dependencies() {
    log_info "安装项目依赖..."
    if [ -f "package.json" ]; then
        npm install
        log_success "依赖安装完成"
    else
        log_error "未找到package.json文件"
        exit 1
    fi
}

# 检查环境文件
check_environment() {
    log_info "检查环境配置文件..."
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            log_warning "已创建.env文件，请根据实际需要修改配置"
            log_warning "请编辑.env文件并设置数据库等配置信息"
        else
            log_error "未找到.env.example文件"
            exit 1
        fi
    else
        log_success "环境配置文件已存在"
    fi
}

# 初始化数据库
init_database() {
    log_info "初始化数据库..."
    if [ -f "scripts/init_database.sql" ]; then
        log_info "请手动执行数据库初始化脚本:"
        log_info "mysql -u root -p < scripts/init_database.sql"
        log_warning "请确保已创建数据库并配置正确的连接信息"
    else
        log_error "未找到数据库初始化脚本"
        exit 1
    fi
}

# 构建项目
build_project() {
    log_info "构建TypeScript项目..."
    if [ -f "tsconfig.json" ]; then
        npm run build
        log_success "项目构建完成"
    else
        log_warning "未找到tsconfig.json，跳过构建步骤"
    fi
}

# 运行测试
run_tests() {
    log_info "运行系统测试..."
    if npm run test; then
        log_success "所有测试通过"
    else
        log_warning "部分测试失败，请检查错误信息"
    fi
}

# 创建报告目录
create_directories() {
    log_info "创建必要的目录..."
    mkdir -p reports
    mkdir -p logs
    mkdir -p data/backup
    log_success "目录创建完成"
}

# 设置文件权限
set_permissions() {
    log_info "设置文件权限..."
    chmod +x scripts/*.sh 2>/dev/null || true
    chmod 644 .env 2>/dev/null || true
    log_success "权限设置完成"
}

# 显示使用说明
show_usage() {
    echo ""
    echo "📖 使用说明:"
    echo "==========="
    echo "1. 开发模式运行: npm run dev"
    echo "2. 生产模式运行: npm start"
    echo "3. 测试单个模块:"
    echo "   - 乘联会采集: npm run test:cpca"
    echo "   - 平台监测: npm run test:platform"
    echo "   - 领袖追踪: npm run test:leader"
    echo "   - 模板测试: npm run test:template"
    echo "4. 代码检查: npm run check"
    echo "5. 构建项目: npm run build"
    echo ""
    echo "⏰ 定时任务:"
    echo "系统默认设置每日06:00自动开始数据采集"
    echo "可通过系统定时任务(crontab)或PM2进行进程管理"
    echo ""
    echo "📊 监控面板:"
    echo "系统运行日志将保存在logs目录下"
    echo "可通过查看日志文件监控系统状态"
    echo ""
}

# 主函数
main() {
    echo "开始系统初始化..."
    echo ""
    
    # 检查环境
    check_node_version
    check_npm_version
    
    # 安装依赖
    install_dependencies
    
    # 检查配置
    check_environment
    
    # 创建目录
    create_directories
    
    # 设置权限
    set_permissions
    
    # 构建项目
    build_project
    
    # 数据库初始化提示
    init_database
    
    # 运行测试
    run_tests
    
    # 显示使用说明
    show_usage
    
    log_success "系统初始化完成！"
    echo ""
    echo "🎉 新能源汽车情报系统已准备就绪！"
    echo "请根据使用说明开始您的数据收集之旅。"
    echo ""
}

# 命令行参数处理
case "${1:-}" in
    "help"|"-h"|"--help")
        show_usage
        ;;
    "install")
        main
        ;;
    "test")
        run_tests
        ;;
    "build")
        build_project
        ;;
    "start")
        npm start
        ;;
    "dev")
        npm run dev
        ;;
    *)
        echo "使用方法: $0 [install|test|build|start|dev|help]"
        echo ""
        echo "命令说明:"
        echo "  install - 完整系统初始化（默认）"
        echo "  test    - 运行系统测试"
        echo "  build   - 构建项目"
        echo "  start   - 启动生产环境"
        echo "  dev     - 启动开发环境"
        echo "  help    - 显示帮助信息"
        echo ""
        echo "直接运行 $0 将执行完整初始化流程"
        echo ""
        ;;
esac