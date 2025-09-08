@echo off
echo ==========================================
echo  Sequential Image Loader 测试服务器启动
echo ==========================================
echo.
echo 正在启动本地测试服务器...
echo 浏览器将自动打开 http://localhost:4000
echo.
echo 功能验证要点：
echo - 图片是否按顺序加载
echo - 是否显示加载进度条
echo - 是否避免了503错误
echo - 懒加载是否正常工作
echo.
echo 按 Ctrl+C 停止服务器
echo ==========================================
echo.

hexo server --open

pause
