#!/bin/bash

# Nginx安全配置测试脚本
# 用于验证目录访问保护和静态文件访问控制

echo "=========================================="
echo "Nginx 安全配置测试"
echo "=========================================="
echo ""

BASE_URL="http://localhost:3320"

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试函数
test_url() {
    local url=$1
    local expected=$2
    local description=$3

    echo -n "测试: $description ... "

    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)

    if [ "$response" == "$expected" ]; then
        echo -e "${GREEN}✓ 通过${NC} (HTTP $response)"
        return 0
    else
        echo -e "${RED}✗ 失败${NC} (期望: $expected, 实际: $response)"
        return 1
    fi
}

echo "1. 测试禁止直接访问目录下的HTML文件"
echo "----------------------------------------"
test_url "$BASE_URL/home/index.html" "404" "访问 /home/index.html"
test_url "$BASE_URL/index/index.html" "404" "访问 /index/index.html"
test_url "$BASE_URL/index/legal.html" "404" "访问 /index/legal.html"
test_url "$BASE_URL/index/privacy.html" "404" "访问 /index/privacy.html"
test_url "$BASE_URL/static/article/contact.html" "404" "访问 /static/article/contact.html"
echo ""

echo "2. 测试禁止目录遍历"
echo "----------------------------------------"
test_url "$BASE_URL/home/" "404" "访问 /home/ 目录"
test_url "$BASE_URL/index/" "404" "访问 /index/ 目录"
test_url "$BASE_URL/static/" "404" "访问 /static/ 目录"
test_url "$BASE_URL/static/js/" "404" "访问 /static/js/ 目录"
test_url "$BASE_URL/static/css/" "404" "访问 /static/css/ 目录"
echo ""

echo "3. 测试静态文件必须通过/static路径访问"
echo "----------------------------------------"
test_url "$BASE_URL/static/js/main.js" "200" "访问 /static/js/main.js (正确路径)"
test_url "$BASE_URL/static/css/main.css" "200" "访问 /static/css/main.css (正确路径)"
echo ""

echo "4. 测试禁止直接访问非/static路径的静态文件"
echo "----------------------------------------"
test_url "$BASE_URL/home/index.js" "404" "访问 /home/index.js (错误路径)"
test_url "$BASE_URL/index/style.css" "404" "访问 /index/style.css (错误路径)"
echo ""

echo "5. 测试隐藏文件和备份文件访问"
echo "----------------------------------------"
test_url "$BASE_URL/.env" "403" "访问 /.env (隐藏文件)"
test_url "$BASE_URL/.git/config" "403" "访问 /.git/config"
test_url "$BASE_URL/index.php~" "403" "访问 index.php~ (备份文件)"
echo ""

echo "6. 测试允许的正常访问"
echo "----------------------------------------"
test_url "$BASE_URL/" "200" "访问根目录 /"
test_url "$BASE_URL/admin" "200" "访问管理后台 /admin"
test_url "$BASE_URL/health" "200" "访问健康检查 /health"
echo ""

echo "=========================================="
echo "测试完成"
echo "=========================================="
echo ""
echo "说明："
echo "  - 所有HTML文件应该返回404（不允许直接访问）"
echo "  - 所有目录访问应该返回404（防止目录遍历）"
echo "  - 静态文件只能通过/static路径访问"
echo "  - 隐藏文件和备份文件应该返回403"
echo "  - 正常的API和页面访问应该返回200"
echo ""
