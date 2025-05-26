---
title: 关于我
date: 2025-04-25 08:55:37
type: about
top_img: /img/aboutImg.png  # 自定义顶部图
comments: true  # 是否开启评论
description: "这里是你的个人简介"
---

<div class="about-container">
    <div class="about-header">
        <div class="avatar-container">
            <img src="a.png" alt="avatar" class="avatar">
            <div class="avatar-glow"></div>
        </div>
        <h1 class="about-title">薛博璇</h1>
        <p class="about-subtitle">一名来自北信科的鸿蒙开发小菜鸡</p>
    </div>
    <div class="about-content">
        <div class="tech-card">
            <div class="card-header">
                <h2>作为鸿蒙开发者</h2>
            </div>
            <div class="tech-description">
                专注于鸿蒙北向开发，熟悉ArkTS、ArkUI等开发技术，致力于打造流畅、高效的鸿蒙应用。
            </div>
            <img src="HXY.jpg" alt="技术栈概览" class="tech-image">
            <div class="tech-description">
                已经考取鸿蒙开发者高级认证
            </div>
            <img src="professional.jpg" alt="技术栈概览" class="tech-image">
            <img src="hdd.jpg" alt="技术栈概览" class="tech-image">
        </div>
        <div class="tech-card">
            <div class="card-header">
                <h2>作为前端的初学者</h2>
            </div>
            <div class="tech-description">
                对前端技术充满热情，不断学习和探索新的技术，致力于成为一名优秀的前端开发者。
            </div>
            <div class="tech-description">
                曾复刻网易云课堂官网首页
            </div>
            <img src="WYY.png" alt="网易云" class="tech-image">
            <div class="tech-description">
                制作响应式布局的连连看网页小游戏，游玩链接：
                <a href="https://xbxlianliankan.netlify.app/" target="_blank" title="连连看传送门">点击这里体验</a>
            </div>
            <img src="LLK.png" alt="连连看" class="tech-image">
        </div>
        <div class="tech-card">
            <div class="card-header">
                <h2>作为创客空间副社长</h2>
            </div>
            <div class="tech-description">
                两年来举办了多场技术分享交流会，更新社团官网，为社团成员提供技术支持。
                <a href="http://bistumaker.cn/" target="_blank" title="创客官网传送门">点此进入创客空间</a>
            </div>
            <img src="maker1.jpg" alt="maker" class="tech-image">
            <img src="maker2.jpg" alt="maker" class="tech-image">
            <img src="maker3.jpg" alt="maker" class="tech-image">
        </div>
        <div class="tech-card">
            <div class="card-header">
                <h2>作为HSD校园开发者</h2>
            </div>
            <div class="tech-description">
                参加了两次跑跑码特校园挑战赛，参与组织数次HSD技术分享活动。
            </div>
            <img src="hsd6.jpg" alt="hsd" class="tech-image">
            <img src="hsd5.jpg" alt="hsd" class="tech-image">
            <img src="hsd4.jpg" alt="hsd" class="tech-image">
            <img src="hsd2.jpg" alt="hsd" class="tech-image">
            <img src="hsd3.jpg" alt="hsd" class="tech-image">
            <img src="hsd1.jpg" alt="hsd" class="tech-image">
        </div>
                <div class="tech-card">
            <div class="card-header">
                <h2>作为花粉俱乐部宣传部部长</h2>
            </div>
            <div class="tech-description">
                主办了24级招新工作，参与了数次花粉社区活动，也曾前往华为北京研究所参观交流。
            </div>
            <img src="hf7.jpg" alt="hsd" class="tech-image">
            <img src="hf6.jpg" alt="hsd" class="tech-image">
            <img src="hf1.jpg" alt="hsd" class="tech-image">
            <img src="hf2.jpg" alt="hsd" class="tech-image">
            <img src="hf3.jpg" alt="hsd" class="tech-image">
            <img src="hf4.jpg" alt="hsd" class="tech-image">
            <img src="hf5.jpg" alt="hsd" class="tech-image">
            <img src="hf8.jpg" alt="hsd" class="tech-image">
            <img src="hf9.jpg" alt="hsd" class="tech-image">
        </div>
        <div class="about-section">
            <div class="section-header">
                <h2>联系方式</h2>
            </div>
            <div class="card-info-social-icons">
                <a class="social-icon" href="https://github.com/XBXyftx" target="_blank" title="Github">
                    <i class="fab fa-github" style="color: #c3ffff;"></i>
                </a>
                <a class="social-icon" href="mailto:shuaixbx02@outlook.com" target="_blank" title="Email">
                    <i class="fas fa-envelope" style="color: #4a7dbe;"></i>
                </a>
                <a class="social-icon" href="wechat.png" target="_blank" title="WeChat">
                    <i class="fa-brands fa-weixin" style="color: #7bb342;"></i>
                </a>
            </div>
        </div>
    </div>
</div>

<style>
.about-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

.about-header {
    text-align: center;
    margin-bottom: 3rem;
    position: relative;
}

.avatar-container {
    position: relative;
    width: 150px;
    height: 150px;
    margin: 0 auto 1.5rem;
}

.avatar {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid #4a90e2;
    box-shadow: 0 0 20px rgba(74, 144, 226, 0.5);
}

.avatar-glow {
    position: absolute;
    top: -5px;
    left: -5px;
    right: -5px;
    bottom: -5px;
    border-radius: 50%;
    background: linear-gradient(45deg, #4a90e2, #00ff9d);
    filter: blur(10px);
    opacity: 0.5;
    z-index: -1;
    animation: glow 2s ease-in-out infinite alternate;
}

.about-title {
    font-size: 2.5rem;
    color: #4a90e2;
    margin-bottom: 0.5rem;
    text-shadow: 0 0 10px rgba(74, 144, 226, 0.3);
}

.about-subtitle {
    font-size: 20px;
    color: rgb(146, 197, 255);
}

.tech-card {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 2rem;
    margin-bottom: 2rem;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    text-align: center;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.tech-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #4a90e2, #00ff9d);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.3s ease;
}

.tech-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 40px rgba(74, 144, 226, 0.2);
    border-color: rgba(74, 144, 226, 0.4);
}

.tech-card:hover::before {
    transform: scaleX(1);
}

.card-header {
    margin-bottom: 1.5rem;
    position: relative;
}

.card-header h2 {
    font-size: 1.8rem;
    color: #4a90e2;
    margin: 0;
    position: relative;
    display: inline-block;
}

.card-header h2::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 50px;
    height: 3px;
    background: linear-gradient(90deg, #4a90e2, #00ff9d);
    border-radius: 2px;
}

.tech-description {
    margin-bottom: 2rem;
    color: rgb(146, 197, 255);
    font-size: 1.1rem;
    line-height: 1.6;
    position: relative;
    padding: 0 1rem;
}

.tech-description a {
    color: #4a90e2;
    text-decoration: none;
    position: relative;
    transition: color 0.3s ease;
}

.tech-description a::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100%;
    height: 2px;
    background: #4a90e2;
    transform: scaleX(0);
    transform-origin: right;
    transition: transform 0.3s ease;
}

.tech-description a:hover {
    color: #00ff9d;
}

.tech-description a:hover::after {
    transform: scaleX(1);
    transform-origin: left;
}

.tech-image {
    width: 100%;
    max-width: 800px;
    height: auto;
    margin: 0 auto;
    display: block;
    border-radius: 15px;
    box-shadow: 0 8px 32px rgba(74, 144, 226, 0.2);
    margin-bottom: 1.5rem;
    transition: transform 0.3s ease, box-shadow 0.3s ease, opacity 0.5s ease;
    opacity: 0;
    position: relative;
    background: linear-gradient(90deg, rgba(74, 144, 226, 0.1) 0%, rgba(0, 255, 157, 0.1) 50%, rgba(74, 144, 226, 0.1) 100%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
}

.tech-image.loaded {
    opacity: 1;
    animation: none;
    background: none;
}

@keyframes shimmer {
    0% {
        background-position: -200% 0;
    }
    100% {
        background-position: 200% 0;
    }
}

.tech-image-container {
    position: relative;
    overflow: hidden;
    border-radius: 15px;
    margin-bottom: 1.5rem;
}

.tech-image-container::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, rgba(74, 144, 226, 0.1), rgba(0, 255, 157, 0.1));
    opacity: 0;
    transition: opacity 0.3s ease;
}

.tech-image-container:hover::after {
    opacity: 0.3;
}

.tech-image:hover {
    transform: scale(1.02);
    box-shadow: 0 12px 40px rgba(74, 144, 226, 0.3);
}

.card-info-social-icons {
    display: flex;
    justify-content: center;
    gap: 2rem;
    margin-top: 2rem;
}

.social-icon {
    font-size: 2rem;
    transition: transform 0.3s ease, color 0.3s ease;
    position: relative;
}

.social-icon::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 50%;
    transform: translateX(-50%) scaleX(0);
    width: 100%;
    height: 2px;
    background: currentColor;
    transition: transform 0.3s ease;
}

.social-icon:hover {
    transform: translateY(-5px);
}

.social-icon:hover::after {
    transform: translateX(-50%) scaleX(1);
}

.tech-stack {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-top: 1.5rem;
    justify-content: center;
}

.about-section {
    margin-bottom: 3rem;
}

.section-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.section-icon {
    width: 32px;
    height: 32px;
}

.project-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
}

.project-card {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 15px;
    overflow: hidden;
    transition: transform 0.3s ease;
}

.project-card:hover {
    transform: translateY(-5px);
}

.project-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
}

.project-info {
    padding: 1.5rem;
}

.contact-info {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
}

.contact-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.contact-item img {
    width: 24px;
    height: 24px;
}

@keyframes glow {
    from {
        opacity: 0.5;
    }
    to {
        opacity: 0.8;
    }
}

@media (max-width: 768px) {
    .about-container {
        padding: 1rem;
    }
    
    .tech-card {
        padding: 1.5rem;
    }
    
    .card-header h2 {
        font-size: 1.5rem;
    }
    
    .tech-description {
        font-size: 1rem;
    }
    
    .social-icon {
        font-size: 1.8rem;
    }
    
    .tech-stack {
        justify-content: center;
    }
    
    .contact-info {
        justify-content: center;
    }
}
</style>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('.tech-image');
    
    images.forEach(img => {
        // 如果图片已经缓存，直接显示
        if (img.complete) {
            img.classList.add('loaded');
        } else {
            // 监听图片加载完成事件
            img.addEventListener('load', function() {
                this.classList.add('loaded');
            });
            
            // 监听图片加载错误事件
            img.addEventListener('error', function() {
                this.style.background = 'rgba(255, 0, 0, 0.1)';
                this.style.border = '2px dashed #ff0000';
            });
        }
    });
});
</script>
