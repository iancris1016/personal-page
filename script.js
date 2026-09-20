/* ======================================================
   Ian Zeng · Personal Page — Interactive Scripts
   ====================================================== */

(function () {
    'use strict';

    /* -------- 1. Navbar scroll effect & smooth anchor -------- */
    const nav = document.getElementById('nav');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.querySelector('.nav-links');

    function onScroll() {
        if (window.scrollY > 30) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('open');
        const spans = navToggle.querySelectorAll('span');
        if (navLinks.classList.contains('open')) {
            spans[0].style.transform = 'rotate(45deg) translateY(7px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translateY(-7px)';
        } else {
            spans[0].style.transform = '';
            spans[1].style.opacity = '';
            spans[2].style.transform = '';
        }
    });

    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', function (e) {
            const id = this.getAttribute('href');
            if (id.length <= 1) return;
            const target = document.querySelector(id);
            if (!target) return;
            e.preventDefault();
            const top = target.getBoundingClientRect().top + window.scrollY - 70;
            window.scrollTo({ top, behavior: 'smooth' });
            if (navLinks.classList.contains('open')) {
                navLinks.classList.remove('open');
                const spans = navToggle.querySelectorAll('span');
                spans[0].style.transform = '';
                spans[1].style.opacity = '';
                spans[2].style.transform = '';
            }
        });
    });

    /* -------- 2. Expandable timeline cards: tl-header click + bottom-left tl-arrow rotate -------- */
    const expandables = document.querySelectorAll('.timeline-item.expandable');
    expandables.forEach(item => {
        const header = item.querySelector('.tl-header');

        // Auto-expand the first two for better first impression
        const idx = Array.from(expandables).indexOf(item);
        if (idx <= 1) item.classList.add('expanded');

        const toggle = (e) => {
            // 当用户点击result-toggle或其内部节点时，不触发整卡展开（避免嵌套按钮冲突
            if (e && e.target) {
                if (e.target.closest('.result-toggle, .result-wrap')) return;
            }
            if (e) e.stopPropagation();
            item.classList.toggle('expanded');
        };
        if (header) {
            header.style.cursor = 'pointer';
            header.addEventListener('click', toggle);
        }
    });

    /* -------- 2.1 Media cards expandable: 点击整卡展开全图 -------- */
    document.querySelectorAll('.media-expandable').forEach(card => {
        card.addEventListener('click', (e) => {
            // 避免点击截图本身触发lightbox不冲突: 只有非media-screenshot内触发展开
            if (e.target.closest('.media-screenshot')) {
                // 点击截图本身，交给lightbox逻辑
                return;
            }
            e.stopPropagation();
            card.classList.toggle('media-open');
            const hint = card.querySelector('.media-hint span');
            if (hint) {
                hint.textContent = card.classList.contains('media-open') ? '点击收起预览' : '点击展开预览';
            }
        });
    });

    /* -------- 3. Result section toggle (inside each timeline card) -------- */
    document.querySelectorAll('.result-toggle').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const wrap = btn.closest('.result-wrap');
            if (!wrap) return;
            wrap.classList.toggle('show-result');
            const svg = btn.querySelector('svg');
            if (svg) {
                svg.style.transition = 'transform 0.3s';
                svg.style.transform = wrap.classList.contains('show-result')
                    ? 'rotate(180deg)' : '';
            }
            const label = btn.childNodes[0];
            if (label && label.nodeType === Node.TEXT_NODE) {
                label.textContent = wrap.classList.contains('show-result')
                    ? '收起详情 · Action & Result ' : '查看详情 · Action & Result ';
            }
        });
    });

    /* -------- 4. About direction cards expand (互斥展开) -------- */
    const dirItems = document.querySelectorAll('.dir-item');
    const dirDetails = document.querySelectorAll('.dir-detail');

    function closeAllDirs() {
        dirItems.forEach(d => d.classList.remove('dir-open'));
        dirDetails.forEach(d => d.classList.remove('show'));
    }

    dirItems.forEach(item => {
        item.addEventListener('click', () => {
            const dirNum = item.getAttribute('data-dir');
            const target = document.getElementById('dir-' + dirNum);
            const isOpen = item.classList.contains('dir-open');

            if (isOpen) {
                // close itself
                item.classList.remove('dir-open');
                if (target) target.classList.remove('show');
            } else {
                // close others, open this one
                closeAllDirs();
                item.classList.add('dir-open');
                if (target) target.classList.add('show');
            }
        });
    });

    /* -------- 5. Gallery category expand -------- */
    document.querySelectorAll('.cat-expand-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const card = btn.closest('.cat-card');
            if (!card) return;
            card.classList.toggle('cat-open');
            const svg = btn.querySelector('svg');
            if (svg) {
                svg.style.transition = 'transform 0.3s';
                svg.style.transform = card.classList.contains('cat-open')
                    ? 'rotate(180deg)' : '';
            }
            const label = btn.childNodes[0];
            if (label && label.nodeType === Node.TEXT_NODE) {
                label.textContent = card.classList.contains('cat-open')
                    ? '收起作品 ' : '展开全部作品 ';
            }
        });
    });

    /* -------- 6. Lightbox for gallery / photo placeholders / real <img> -------- */
    const lightbox = document.getElementById('lightbox');
    const lbImage = document.getElementById('lbImage');
    const lbCaption = document.getElementById('lbCaption');
    const lbClose = document.getElementById('lbClose');

    function resolvePhotoTarget(clickNode) {
        if (!clickNode) return null;
        const realImg = clickNode.matches('img.photo-placeholder, img.photo-id, img.gallery-img, img.review-cover, img.media-screenshot, img.cat-img, img.cat-preview')
            ? clickNode
            : clickNode.querySelector('img.photo-placeholder, img.photo-id, img.gallery-img, img.review-cover, img.media-screenshot, img.cat-img, img.cat-preview');
        if (realImg) return { kind: 'image', el: realImg, src: realImg.src, label: realImg.alt || realImg.getAttribute('data-label') || 'Photo' };
        const svgWrap = clickNode.matches('.photo-placeholder, .tl-photo, .review-cover, .media-screenshot, .cat-preview-item, .cat-img, .hero-g-item, .photo-id')
            ? clickNode
            : clickNode.querySelector('.photo-placeholder, .tl-photo, .review-cover, .media-screenshot, .cat-preview-item, .cat-img, .hero-g-item, .photo-id');
        if (svgWrap) {
            const svg = svgWrap.querySelector('svg');
            const label = svgWrap.getAttribute('data-label') || 'Photo';
            const bg = window.getComputedStyle(svgWrap).background;
            return { kind: 'svg', el: svgWrap, svg, label, bg };
        }
        return null;
    }

    function openLightbox(clickNode) {
        const p = resolvePhotoTarget(clickNode);
        if (!p) return;
        if (lbImage) lbImage.innerHTML = '';
        if (lbImage) lbImage.style.background = '';
        if (p.kind === 'image') {
            const img = document.createElement('img');
            img.src = p.src;
            img.alt = p.label;
            img.style.maxWidth = '90vw';
            img.style.maxHeight = '82vh';
            img.style.width = 'auto';
            img.style.height = 'auto';
            img.style.borderRadius = '14px';
            img.style.boxShadow = '0 30px 80px rgba(17,20,24,0.32)';
            img.style.objectFit = 'contain';
            lbImage.appendChild(img);
        } else if (p.kind === 'svg' && p.svg) {
            const clone = p.svg.cloneNode(true);
            clone.setAttribute('width', '40%');
            clone.setAttribute('height', '40%');
            lbImage.appendChild(clone);
            if (lbImage && p.bg) lbImage.style.background = p.bg;
        }
        if (lbCaption) lbCaption.textContent = p.label;
        lbImage.setAttribute('data-label', p.label);
        lightbox.classList.add('open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }
    function closeLightbox() {
        lightbox.classList.remove('open');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    const photoNodes = document.querySelectorAll(
        '.photo-placeholder, .gallery-img, .tl-photo, .review-cover, .media-screenshot, .hero-g-item, .cat-preview-item, .cat-img, .photo-id'
    );
    photoNodes.forEach(node => {
        node.addEventListener('click', (e) => {
            e.stopPropagation();
            openLightbox(node);
        });
    });
    if (lbClose) lbClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
    });

    /* -------- 7. Reveal on scroll -------- */
    const revealTargets = document.querySelectorAll(
        '.section-label, .about-intro, .about-info, .skill-card, .timeline-item, .media-card, .review-card, .g-item, .contact-card, .dir-item, .cat-card'
    );
    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });

    revealTargets.forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `opacity 0.7s cubic-bezier(.2,.7,.2,1) ${(i % 5) * 60}ms, transform 0.7s cubic-bezier(.2,.7,.2,1) ${(i % 5) * 60}ms`;
        io.observe(el);
    });

    /* -------- 8. Marquee pause on hover -------- */
    const marquee = document.querySelector('.marquee-track');
    if (marquee) {
        marquee.parentElement.addEventListener('mouseenter', () => {
            marquee.style.animationPlayState = 'paused';
        });
        marquee.parentElement.addEventListener('mouseleave', () => {
            marquee.style.animationPlayState = 'running';
        });
    }

    /* -------- 9. Social link real URLs & tooltips (Media区 + 旧社交兼容) -------- */
    const socialLinks = document.querySelectorAll('[data-link]');
    const placeholderURLs = {
        'douyin-wedding': '抖音婚礼跟拍主页 - 后续把真实链接填入 script.js realURLs 中',
        'xhs-music':      '小红书乐评账号主页 - 后续把真实链接填入 script.js realURLs 中',
        'xhs':            '小红书主页：ID 95302083411',
        'wechat':         '微信号：iancris_1016（请复制到微信添加）',
        'qq':             'QQ号：1803861827',
    };
    const realURLs = {
        // 自媒体主页真实链接后续填入，Media区会被 <a> 点击跳转
        'douyin-wedding': '#',
        'xhs-music':      '#',
        'xhs':            '#',
        'wechat':         '#',
        'qq':             '#',
    };
    socialLinks.forEach(a => {
        const key = a.getAttribute('data-link');
        if (!key) return;
        const url = realURLs[key] || '#';
        if (a.tagName === 'A' && url !== '#') {
            a.setAttribute('href', url);
            a.setAttribute('target', '_blank');
            a.setAttribute('rel', 'noopener noreferrer');
        } else if (a.tagName === 'A') {
            a.setAttribute('href', '#');
            a.addEventListener('click', (e) => { e.preventDefault(); });
        }
        // Show tooltip (只对没有文本的老结构s-link或media-link显示提醒)
        const tip = placeholderURLs[key];
        if (tip && url === '#') a.title = tip;
        if (url === '#') {
            a.dataset.placeholder = 'true';
        }
    });

    /* -------- 10. Hero parallax (subtle) -------- */
    const hero = document.querySelector('.hero');
    const heroPhoto = document.querySelector('.hero-photo');
    const heroText = document.querySelector('.hero-text');
    if (hero && heroPhoto) {
        window.addEventListener('scroll', () => {
            const y = window.scrollY;
            if (y < 600) {
                heroPhoto.style.transform = `translateY(${y * 0.12}px)`;
                if (heroText) heroText.style.transform = `translateY(${y * 0.04}px)`;
            }
        }, { passive: true });
    }

    console.log('%c· Ian Zeng · Personal Page loaded ·', 'color:#5E95C4;font-family:Inter,sans-serif;font-size:15px;font-weight:bold;');

})();
