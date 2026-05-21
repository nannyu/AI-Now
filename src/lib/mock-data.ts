export interface StartupMeta {
    entity: string;
    sector: string;
    valuation: string;
    investors: string;
    techStack: string;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
}

export interface Article {
    id: string;
    slug: string;
    title: string;
    subtitle: string;
    summary: string;
    body: string;
    author: string;
    categoryLabel: string;
    publishDate: string;
    readingMinutes: number;
    coverImage: string;
    categories: Category[];
    isFeatured: boolean;
    startup?: StartupMeta;
    translations?: {
        [locale: string]: {
            title: string;
            subtitle: string;
            summary: string;
            body: string;
            author: string;
            categoryLabel: string;
        }
    };
}

export const categories: Category[] = [
    { id: "1", name: "Founder Interviews", slug: "founder-interviews" },
    { id: "2", name: "AI Products & Apps", slug: "ai-products" },
    { id: "3", name: "AI Hardware & Embodied", slug: "ai-hardware" },
    { id: "4", name: "Content, IP & Media", slug: "content-ip-media" },
    { id: "5", name: "Technical Deep Dives", slug: "technical-deep-dives" },
    { id: "6", name: "Hunt Night & Community", slug: "hunt-night-community" },
    { id: "7", name: "Funding & Strategy", slug: "funding-strategy" },
];

export const articles: Article[] = [
    {
        id: "1",
        slug: "minimax-ecology-strategy",
        title: "The Silent Leap: How Beijing’s MiniMax Quietly Captured the Mass AI Market via WeChat & Low-Cost APIs",
        subtitle: "Analyzing the strategic survival blueprint and cold-start tactical playbook of China's Generative AI giants.",
        summary: "Amidst China's hyper-competitive and hardware-constrained Generative AI landscape, MiniMax has established an unconventional vector for immediate market dominance through WeChat mini-programs and low-margin APIs.",
        body: "In China's white-hot generative AI arena, MiniMax (稀宇科技), founded by key computer vision architects, has carved out a highly pragmatic growth trajectory. Unlike Silicon Valley giants that spend fortunes on mainstream media campaigns, MiniMax's core strategy relies on WeChat's massive domestic private networks.\n\nAnalysts have documented that MiniMax's avatar companion product 'Xingye' secured over 4 million active accounts. It achieved this in record time through a system of lightweight WeChat mini-program wrappers and viral KOL citations, bypassing classic developer fees entirely.\n\nData indicates that MiniMax is preparing to roll out a dynamic Mixture of Experts (MoE) infrastructure. Armed with high-affinity Tencent cloud integrations, their inferred token delivery costs collapsed by 42%, establishing an aggressive low-margin barrier designed to shut out independent developers.",
        author: "Lu Haifeng",
        categoryLabel: "INTELLIGENCE BRIEFING / STARTUP LANDSCAPE",
        publishDate: "2026-05-22",
        readingMinutes: 6,
        coverImage: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&h=675&fit=crop",
        categories: [categories[6], categories[1]],
        isFeatured: true,
        startup: {
            entity: "MiniMax AI (稀宇科技)",
            sector: "Generative LLM & Contextual Agent Playgrounds",
            valuation: "$2.5B USD (Series B Dec 2024)",
            investors: "Alibaba, Tencent, HongShan (Sequoia China), IDG Capital",
            techStack: "Abab 6.5 MOE Model / High-Density WebView Integration",
        },
        translations: {
            zh: {
                title: "北京AI新贵MiniMax的生态战法：依托微信裂变与极简API的零成本获客内幕",
                subtitle: "还原中国AI初创企业的生存哲学与冷启动蓝图。",
                summary: "在中国竞争白热化的生成式AI竞技场中，独角兽「MiniMax」（稀宇科技）走出了一条极其务实的突围曲线。依靠微信极其庞大的私域网络搭建裂变入口，并在后端快速部署低延时极简API，实现了流量与商用的双突破。",
                body: "在中国竞争白热化的生成式AI竞技场中，由前商汤科技副总裁创立的独角兽「MiniMax」（稀宇科技）走出了一条极其务实的突围曲线。与硅谷巨头斥巨资进行纯底层模型宣发不同，MiniMax的核心战略是紧密依附微信极其庞大的私域网络搭建裂变入口，并在后端快速部署低延时的极简API组件。\n\n我们发现其最新推出的虚拟社交伴侣「星野」在短短两个季度内，通过上万个深度绑定的KOL公域文章及小程序入口套壳，完成了数百万用户的原始积累。这一路径为全球投资者提供了一个极具参考价值的标本：在算力供应高度受限的环境下，应用层的增长效率往往比单纯追求大参数更具决定性。\n\n此外，北京研发总部的核心信源透露，MiniMax正在秘密测试新一代多模态混合专家架构（MoE）。通过与腾讯云基础设施的底座联调，其推理开销降低了近42%。这使得他们能在竞争对手仍纠结于算存成本的阶段，直接发起新一轮针对开发者生态的超低价API洗牌掠夺。",
                author: "陆海峰",
                categoryLabel: "智库专报 / 创投深度生态"
            },
            en: {
                title: "The Silent Leap: How Beijing’s MiniMax Quietly Captured the Mass AI Market via WeChat & Low-Cost APIs",
                subtitle: "Analyzing the strategic survival blueprint and cold-start tactical playbook of China's Generative AI giants.",
                summary: "Amidst China's hyper-competitive and hardware-constrained Generative AI landscape, MiniMax has established an unconventional vector for immediate market dominance through WeChat mini-programs and low-margin APIs.",
                body: "In China's white-hot generative AI arena, MiniMax (稀宇科技), founded by key computer vision architects, has carved out a highly pragmatic growth trajectory. Unlike Silicon Valley giants that spend fortunes on mainstream media campaigns, MiniMax's core strategy relies on WeChat's massive domestic private networks.\n\nAnalysts have documented that MiniMax's avatar companion product 'Xingye' secured over 4 million active accounts. It achieved this in record time through a system of lightweight WeChat mini-program wrappers and viral KOL citations, bypassing classic developer fees entirely.\n\nData indicates that MiniMax is preparing to roll out a dynamic Mixture of Experts (MoE) infrastructure. Armed with high-affinity Tencent cloud integrations, their inferred token delivery costs collapsed by 42%, establishing an aggressive low-margin barrier designed to shut out independent developers.",
                author: "Lu Haifeng",
                categoryLabel: "INTELLIGENCE BRIEFING / STARTUP LANDSCAPE"
            },
            de: {
                title: "Der stille Sprung: Wie Pekings MiniMax durch WeChat-Funnels und minimale APIs den KI-Massenmarkt erobert",
                subtitle: "Eine Analyse der pragmatischen Überlebensstrategien chinesischer KI-Unicorns inmitten globaler Halbleiterengpässe.",
                summary: "In Chinas extrem kompetitivem Ökosystem für generative KI hat MiniMax—ein von ehemaligen Halbleiterspezialisten gegründetes Unicorn—einen pragmatischen Weg zur Marktführerschaft eingeschlagen.",
                body: "In Chinas extrem kompetitivem Ökosystem für generative KI hat MiniMax—ein von ehemaligen Halbleiterspezialisten gegründetes Unicorn—einen pragmatischen Weg zur Marktführerschaft eingeschlagen. Während westliche Akteure auf teure native App-Store-Kampagnen setzen, nutzt MiniMax die tief verwurzelten WeChat-Netzwerke für virales Wachstum.\n\nSpezifische RSS-Inhaltsströme zeigen, dass MiniMax' KI-Avatar 'Xingye' innerhalb kürzester Zeit Millionen Nutzer akquirierte. Durch smarte Verlinkungen in regionalen Artikeln und schlanke WeChat-Micro-Programme wurden teure Werbebudgets komplett umgangen, was Investoren weltweit aufhorchen lässt.\n\nLaut exklusiven Berichten aus Beijing testet das Team derzeit eine hochgradig skalierbare Mixture-of-Experts-Architektur (MoE). In enger Kooperation mit lokalen Cloud-Betreibern sanken die Inferenzkosten um fast 42 Prozent. Dies ermöglicht eine radikale Preissenkung für asiatische Entwickler-APIs.",
                author: "Lu Haifeng",
                categoryLabel: "INTELLIGENZ-ANALYSE / DIE DEUTSCHE PERSPEKTIVE"
            }
        }
    },
    {
        id: "2",
        slug: "deepseek-open-source-revolution",
        title: "DeepSeek Open Source Revolution: How a Chinese Lab is Reshaping the AI Landscape",
        subtitle: "Analyzing how a small Chinese quantitative trading lab built models challenging Western incumbents.",
        summary: "DeepSeek has emerged as a formidable force in AI research, releasing models that rival the best from OpenAI and Google while keeping them open source.",
        body: "DeepSeek's release of its open-source MoE model has shaken the foundations of the global AI ecosystem. Developed by a subsidiary of quantitative trading firm High-Flyer, the model offers performance comparable to state-of-the-art closed models at a fraction of the cost.\n\nWhat sets DeepSeek apart is its relentless focus on training efficiency. Utilizing techniques like Multi-Head Latent Attention (MLA) and DeepSeek-MoE, they managed to dramatically reduce memory footprints during inference. This efficiency has sparked a price war in global API services.\n\nFor global companies, DeepSeek provides a viable alternative to proprietary models, offering complete transparency and the ability to run high-level intelligence models on-premise.",
        author: "Zhang Wei",
        categoryLabel: "TECHNICAL BREAKTHROUGHS / CHIP GEOPOLITICS",
        publishDate: "2026-05-20",
        readingMinutes: 8,
        coverImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=675&fit=crop",
        categories: [categories[4]],
        isFeatured: false,
        startup: {
            entity: "DeepSeek AI (深度求索)",
            sector: "High-Efficiency Reasoning Models & Open Source Infrastructure",
            valuation: "$3.0B USD (Est. early 2026)",
            investors: "High-Flyer Quant, Sequoia China, Capital Today",
            techStack: "DeepSeek-V3 MoE / Multi-Head Latent Attention (MLA)",
        },
        translations: {
            zh: {
                title: "DeepSeek的开源革命：一个量化实验室如何颠覆全球大模型格局",
                subtitle: "分析一家源于量化交易大厂的中国AI机构如何打造挑战硅谷巨头的开源架构。",
                summary: "DeepSeek以极低的算力开销推出了在推理和逻辑性能上比肩OpenAI主力模型的开源架构，引发了全球开发者社区的轰动与AI基础设施重构。",
                body: "DeepSeek开源MoE模型的发布震动了全球AI生态的基石。作为量化交易巨头幻方量化旗下的研究室，DeepSeek以极低的算力开销完成了高性能模型的训练与部署，在多项学术指标上与顶尖闭源模型平分秋色。\n\nDeepSeek的核心突破在于其独特的计算架构创新。通过引入多头潜在注意力（MLA）机制和优化专家路由，他们显著减少了推理阶段的显存占用和计算负载。这迫使主流厂商开启了新一轮针对API价格的降价狂潮。\n\n对全球企业而言，DeepSeek提供了一个极具吸引力的私有化部署选项，不仅实现了完整的模型自主掌控权，还大大降低了高性能推理在生产环境中的落地成本。",
                author: "张伟",
                categoryLabel: "技术突破 / 地缘算力与架构"
            },
            en: {
                title: "DeepSeek Open Source Revolution: How a Chinese Lab is Reshaping the AI Landscape",
                subtitle: "Analyzing how a small Chinese quantitative trading lab built models challenging Western incumbents.",
                summary: "DeepSeek has emerged as a formidable force in AI research, releasing models that rival the best from OpenAI and Google while keeping them open source.",
                body: "DeepSeek's release of its open-source MoE model has shaken the foundations of the global AI ecosystem. Developed by a subsidiary of quantitative trading firm High-Flyer, the model offers performance comparable to state-of-the-art closed models at a fraction of the cost.\n\nWhat sets DeepSeek apart is its relentless focus on training efficiency. Utilizing techniques like Multi-Head Latent Attention (MLA) and DeepSeek-MoE, they managed to dramatically reduce memory footprints during inference. This efficiency has sparked a price war in global API services.\n\nFor global companies, DeepSeek provides a viable alternative to proprietary models, offering complete transparency and the ability to run high-level intelligence models on-premise.",
                author: "Zhang Wei",
                categoryLabel: "TECHNICAL BREAKTHROUGHS / CHIP GEOPOLITICS"
            },
            de: {
                title: "Die DeepSeek Open-Source-Revolution: Wie ein chinesisches Labor die KI-Landschaft neu ordnet",
                subtitle: "Eine Analyse, wie ein quantitatives Handelslabor hocheffiziente Modelle baut, die OpenAI herausfordern.",
                summary: "DeepSeek hat sich zu einer ernsthaften Kraft in der KI-Forschung entwickelt und Modelle veröffentlicht, die mit den besten von OpenAI und Google konkurrieren.",
                body: "DeepSeeks Veröffentlichung seines Open-Source-MoE-Modells hat die Fundamente des globalen KI-Ökosystems erschüttert. Entwickelt von einer Tochtergesellschaft der quantitativen Handelsfirma High-Flyer, bietet das Modell Leistung auf dem Niveau modernster geschlossener Modelle zu einem Bruchteil der Kosten.\n\nWas DeepSeek auszeichnet, ist die unermüdliche Konzentration auf Trainingseffizienz. Durch den Einsatz von Techniken wie Multi-Head Latent Attention (MLA) konnten die Speicheranforderungen bei der Inferenz drastisch gesenkt werden.",
                author: "Zhang Wei",
                categoryLabel: "TECHNISCHE DURCHBRÜCHE / GEOPOLITIK"
            }
        }
    },
    {
        id: "3",
        slug: "zhipu-ai-enterprise-strategy",
        title: "Zhipu AI Enterprise Strategy: Building China's Answer to OpenAI for Business",
        subtitle: "How Tsinghua's spin-off captured 80% of domestic enterprise LLM deployments.",
        summary: "With GLM-4 powering thousands of enterprise clients, Zhipu AI is carving out a unique position in the Chinese AI ecosystem.",
        body: "Zhipu AI, born out of Tsinghua University's research labs, has successfully transitioned from academic champion to commercial market leader. The company’s core strategy revolves around full-stack enterprise enablement.\n\nUnlike startups that target raw consumer chat numbers, Zhipu focuses heavily on localized edge deployments, specialized government contracts, and API pipelines integrated into enterprise software.\n\nTheir recent release, GLM-4, features enhanced context handling and function calling, making it the preferred choice for enterprise tasks requiring high reliability and security in local private clouds.",
        author: "Wang Fang",
        categoryLabel: "ENTERPRISE INTELLIGENCE / SPIN-OFF MODELS",
        publishDate: "2026-05-18",
        readingMinutes: 6,
        coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=675&fit=crop",
        categories: [categories[6], categories[1]],
        isFeatured: false,
        startup: {
            entity: "Zhipu AI (智谱AI)",
            sector: "Full-Stack Enterprise Foundation Models & GLM-4 Ecosystems",
            valuation: "$2.7B USD (Series B+ 2025)",
            investors: "Alibaba, Tencent, Xiaomi, Legend Capital, Meituan",
            techStack: "GLM-4-Plus Series / Local Edge Model Deployments",
        },
        translations: {
            zh: {
                title: "智谱AI的商业版图：清华血统与ToB企业级服务的绝对统治力",
                subtitle: "深度剖析智谱AI如何拿下国内八成大型政企私有化大模型订单。",
                summary: "作为清华大学科研成果转化的排头兵，智谱AI依靠GLM系列模型，在企业级大模型市场树立了坚不可摧的壁垒，成为事实上的中国版 OpenAI 商业样板。",
                body: "源自清华大学计算机系的独角兽「智谱AI」已成功完成了从学术明星到商业巨头的华丽蜕变。与普通只拼C端App流量的创业公司不同，智谱AI将核心精力倾注在大型政企私有化部署、API集成以及定制化垂直行业方案上。\n\n清华大学的技术沉淀赋予了智谱自主掌控全套模型算子与语料训练的实力。其最新发布的 GLM-4-Plus 在函数调用（Function Calling）与长文本理解上极大缩短了与西方顶级商用模型的差距，满足了金融、政务等高度重视数据安全的行业诉求。\n\n通过与金山办公、美团等多家大厂在生产力工具上的深度嵌合，智谱正在组建一个国内覆盖最广的商用API联盟，在生态深度上拉开了与竞争对手的距离。",
                author: "王芳",
                categoryLabel: "企业智库 / 高校孵化范式"
            },
            en: {
                title: "Zhipu AI Enterprise Strategy: Building China's Answer to OpenAI for Business",
                subtitle: "How Tsinghua's spin-off captured 80% of domestic enterprise LLM deployments.",
                summary: "With GLM-4 powering thousands of enterprise clients, Zhipu AI is carving out a unique position in the Chinese AI ecosystem.",
                body: "Zhipu AI, born out of Tsinghua University's research labs, has successfully transitioned from academic champion to commercial market leader. The company’s core strategy revolves around full-stack enterprise enablement.\n\nUnlike startups that target raw consumer chat numbers, Zhipu focuses heavily on localized edge deployments, specialized government contracts, and API pipelines integrated into enterprise software.\n\nTheir recent release, GLM-4, features enhanced context handling and function calling, making it the preferred choice for enterprise tasks requiring high reliability and security in local private clouds.",
                author: "Wang Fang",
                categoryLabel: "ENTERPRISE INTELLIGENCE / SPIN-OFF MODELS"
            },
            de: {
                title: "Zhipu AI Unternehmensstrategie: Chinas Antwort auf OpenAI für Unternehmen",
                subtitle: "Wie das Spin-off der Tsinghua-Universität den heimischen B2B-Markt eroberte.",
                summary: "Mit GLM-4, das Tausende von Unternehmenskunden unterstützt, etabliert sich Zhipu AI in einer Schlüsselposition.",
                body: "Zhipu AI, hervorgegangen aus den Forschungslabors der Tsinghua-Universität, hat den Übergang von der Forschung zur kommerziellen Marktführerschaft gemeistert. Zhipu konzentriert sich stark auf lokalisierte Edge-Bereitstellungen und geschützte Regierungsverträge.\n\nDas neueste Modell GLM-4 bietet verbesserte Kontextverarbeitung, was es zur bevorzugten Wahl für hochsichere private Clouds macht.",
                author: "Wang Fang",
                categoryLabel: "B2B STRATEGIE / UNIVERSITÄTS-SPIN-OFF"
            }
        }
    },
    {
        id: "4",
        slug: "moonshot-ai-kimi-global-launch",
        title: "Moonshot AI Takes Kimi Global: The Long-Context Assistant Expanding Beyond China",
        subtitle: "How Yang Zhilin's team leveraged context leadership to scale international active accounts.",
        summary: "After dominating the Chinese market with its 2-million-token context window, Moonshot AI is now setting its sights on international users.",
        body: "Moonshot AI (月之暗面), founded by Yang Zhilin, a prominent researcher in long-context architectures, has initiated its internationalization plan under a localized consumer brand.\n\nKimi Chat, known for popularizing the concept of 'reading entire novels in one prompt,' has become a cultural phenomenon in China's white-collar worker segment. The expansion leverages proprietary engineering that keeps token retrieval costs low even at massive scales.\n\nAs Moonshot steps into overseas markets, it faces steep competition from Anthropic and OpenAI. However, their superior cost efficiency on long-context processing remains their primary competitive advantage.",
        author: "Chen Hao",
        categoryLabel: "CONSUMER APPS / SCALING VECTORS",
        publishDate: "2026-05-17",
        readingMinutes: 7,
        coverImage: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&h=675&fit=crop",
        categories: [categories[1]],
        isFeatured: false,
        startup: {
            entity: "Moonshot AI (月之暗面)",
            sector: "Ultra-Long Context Window LLMs & Consumer Assistants",
            valuation: "$2.5B USD (Series B Feb 2025)",
            investors: "Alibaba, HongShan (Sequoia China), Tencent, Meituan",
            techStack: "Kimi Chat / 2-Million-Token Context Core",
        },
        translations: {
            zh: {
                title: "月之暗面Kimi的全球突围：依靠“长文本先发优势”的C端增长神话",
                subtitle: "解读天才科学家杨植麟如何用极致的长文本体验撬动大众消费级市场。",
                summary: "月之暗面（Moonshot AI）推出的智能助手Kimi，凭借率先支持200万字超长上下文处理能力，在国内白领和学术圈引发爆炸式口碑，并已开启海外扩张步伐。",
                body: "由青年科学家杨植麟掌舵的「月之暗面」（Moonshot AI）是过去一年中国C端应用层最大的黑马。其推出的智能助手「Kimi智能助手」率先在国内引爆了“超长上下文（Long-Context）”的赛道，并在学术分析、文档处理及深度阅读场景确立了绝对优势。\n\nKimi的成功在于找到了极度痛点的用户场景——快速提取数十万字学术论文或长篇年报的核心信息。这并非空中楼阁，其底层是月之暗面自主研发的无损长文本优化算法，即使在几百万token的负载下，也能保证精确的信息召回率。\n\n在完成数亿美元融资后，月之暗面正悄然孵化其海外业务，试图在更广阔的全球舞台上直面 Anthropic (Claude) 和 OpenAI (ChatGPT) 的竞争，将长文本的技术红利转化为全球用户的基数红利。",
                author: "陈昊",
                categoryLabel: "消费端应用 / 增长杠杆"
            },
            en: {
                title: "Moonshot AI Takes Kimi Global: The Long-Context Assistant Expanding Beyond China",
                subtitle: "How Yang Zhilin's team leveraged context leadership to scale international active accounts.",
                summary: "After dominating the Chinese market with its 2-million-token context window, Moonshot AI is now setting its sights on international users.",
                body: "Moonshot AI (月之暗面), founded by Yang Zhilin, a prominent researcher in long-context architectures, has initiated its internationalization plan under a localized consumer brand.\n\nKimi Chat, known for popularizing the concept of 'reading entire novels in one prompt,' has become a cultural phenomenon in China's white-collar worker segment. The expansion leverages proprietary engineering that keeps token retrieval costs low even at massive scales.\n\nAs Moonshot steps into overseas markets, it faces steep competition from Anthropic and OpenAI. However, their superior cost efficiency on long-context processing remains their primary competitive advantage.",
                author: "Chen Hao",
                categoryLabel: "CONSUMER APPS / SCALING VECTORS"
            },
            de: {
                title: "Moonshot AI geht global: Wie der Kimi-Assistent Grenzen überschreitet",
                subtitle: "Yang Zhilins Team nutzt die Technologieführerschaft bei langen Kontextfenstern.",
                summary: "Nachdem Moonshot AI mit seinem 2-Millionen-Token-Kontextfenster den chinesischen Markt dominiert hat, visiert es nun internationale Märkte an.",
                body: "Moonshot AI (月之暗面), gegründet von Yang Zhilin, hat seine Internationalisierungsstrategie für den verbraucherorientierten Kimi-Assistenten gestartet.\n\nKimi Chat ist berühmt geworden für seine Fähigkeit, enorme Textmengen fehlerfrei zu analysieren. In Übersee trifft das Startup auf Claude und OpenAI, setzt jedoch auf extreme Effizienz bei der Verarbeitung riesiger Dateien.",
                author: "Chen Hao",
                categoryLabel: "B2C ANWENDUNGEN / STRATEGISCHES WACHSTUM"
            }
        }
    },
    {
        id: "5",
        slug: "baichuan-intelligence-founder-interview",
        title: "From Sogou to Baichuan: Wang Xiaochuan on Building AI That Understands Chinese Culture",
        subtitle: "The veteran entrepreneur shares his vision for creating AI models that truly understand the nuances of Chinese language.",
        summary: "The Sogou search engine founder shares his vision for creating AI models that truly understand the nuances of Chinese language and culture.",
        body: "Wang Xiaochuan, the veteran entrepreneur who previously founded Sogou, China's second-largest search engine, is now taking on the AI foundation model race with Baichuan Intelligence.\n\nBaichuan has successfully combined deep retrieval technology with large language models, drawing from Wang's decades of experience in indexing the Chinese web. This fusion allows their models to provide highly accurate, culturally-attuned answers for domestic enterprises.",
        author: "Liu Yang",
        categoryLabel: "FOUNDER STORIES / RETRIEVAL MODALITY",
        publishDate: "2026-05-16",
        readingMinutes: 10,
        coverImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=675&fit=crop",
        categories: [categories[0], categories[6]],
        isFeatured: false,
        translations: {
            zh: {
                title: "王小川的二次创业：从搜狗搜索到百川智能的医疗与文化模型梦",
                subtitle: "专访互联网老兵王小川，探讨如何将搜狗搜索的搜索引擎基因融入生成式大模型中。",
                summary: "搜狗创始人王小川创立百川智能，在医疗大模型和具有深厚中文文化底蕴的底座大模型上构筑差异化优势，力争成为中国医疗AI的首选底座。",
                body: "曾经打造了搜狗搜索引擎的王小川，在大模型浪潮到来后重披战袍，创立了「百川智能」。王小川的策略很清晰：将搜狗时期积累的庞大中文检索语料和精准搜索技术，与最新的生成式 AI 底座进行深度咬合。\n\n目前，百川智能已经推出了多款开源及商用模型，并在国内首批通过了国家大模型备案。更重要的是，百川正在医疗大模型赛道秘密布局，希望通过大模型技术解决优质医疗资源分配不均的长期难题。",
                author: "刘洋",
                categoryLabel: "创始人故事 / 检索与大模型"
            },
            en: {
                title: "From Sogou to Baichuan: Wang Xiaochuan on Building AI That Understands Chinese Culture",
                subtitle: "The veteran entrepreneur shares his vision for creating AI models that truly understand the nuances of Chinese language.",
                summary: "The Sogou search engine founder shares his vision for creating AI models that truly understand the nuances of Chinese language and culture.",
                body: "Wang Xiaochuan, the veteran entrepreneur who previously founded Sogou, China's second-largest search engine, is now taking on the AI foundation model race with Baichuan Intelligence.\n\nBaichuan has successfully combined deep retrieval technology with large language models, drawing from Wang's decades of experience in indexing the Chinese web. This fusion allows their models to provide highly accurate, culturally-attuned answers for domestic enterprises.",
                author: "Liu Yang",
                categoryLabel: "FOUNDER STORIES / RETRIEVAL MODALITY"
            },
            de: {
                title: "Von Sogou zu Baichuan: Wang Xiaochuan über KI und chinesische Kultur",
                subtitle: "Der erfahrene Gründer teilt seine Vision von kulturell adaptierten Large Language Models.",
                summary: "Suchmaschinen-Pionier Wang Xiaochuan baut mit Baichuan Intelligence KI-Modelle, die speziell für den chinesischen Kontext optimiert sind.",
                body: "Wang Xiaochuan, Gründer der zweitgrößten Suchmaschine Chinas (Sogou), stellt sich nun mit Baichuan Intelligence dem globalen KI-Wettlauf.",
                author: "Liu Yang",
                categoryLabel: "GRÜNDERPORTRAIT / KULTURELLE ADAPTION"
            }
        }
    },
    {
        id: "6",
        slug: "chinese-ai-chip-startups-rise",
        title: "The Rise of Chinese AI Chip Startups: Navigating Sanctions and Innovation",
        subtitle: "How local semiconductor startups are redesigning architectures to adapt to hardware limits.",
        summary: "Despite export controls, a new generation of Chinese semiconductor startups is developing innovative AI accelerators.",
        body: "Export restrictions have acted as a double-edged sword in China's silicon landscape. While cutting off access to cutting-edge fabs, it has spurred unprecedented investments into local chip architectures.\n\nCompanies like Biren Technology and Moore Threads are redesigning GPU architectures to optimize performance under constraints, focusing heavily on software compilation tools that allow existing chips to run MoE workloads efficiently.",
        author: "Zhao Min",
        categoryLabel: "CHIP ARCHITECTURE / INDUSTRY TRENDS",
        publishDate: "2026-05-15",
        readingMinutes: 9,
        coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=675&fit=crop",
        categories: [categories[4]],
        isFeatured: false,
        translations: {
            zh: {
                title: "中国AI芯片初创企业的突围之路：地缘限制下的架构创新与软件重构",
                subtitle: "探讨本土半导体企业如何通过改进互联架构和编译器算法，化解外部供应链风险。",
                summary: "面对极端的外部制约，包括壁仞科技、摩尔线程在内的本土GPU芯片设计公司正全力攻克互联带宽与软件生态壁垒，助力算力平替。",
                body: "外部算力出口限制在给国内企业造成阵痛的同时，也以前所未有的力度激活了本土 GPU 和 ASIC 的生态。国内领先的 AI 芯片初创企业正在开展一场关于“系统级平替”的硬核创新。\n\n壁仞科技、沐曦集成电路以及摩尔线程等公司不再一味追求极限单片制程，而是将目光转向片上系统（SoC）互联带宽的提升和编译器软件栈的深度重构，确保国产算力集群能在大模型训练中实现极高的有效算力转化。",
                author: "赵敏",
                categoryLabel: "芯片半导体 / 产业大势"
            },
            en: {
                title: "The Rise of Chinese AI Chip Startups: Navigating Sanctions and Innovation",
                subtitle: "How local semiconductor startups are redesigning architectures to adapt to hardware limits.",
                summary: "Despite export controls, a new generation of Chinese semiconductor startups is developing innovative AI accelerators.",
                body: "Export restrictions have acted as a double-edged sword in China's silicon landscape. While cutting off access to cutting-edge fabs, it has spurred unprecedented investments into local chip architectures.\n\nCompanies like Biren Technology and Moore Threads are redesigning GPU architectures to optimize performance under constraints, focusing heavily on software compilation tools that allow existing chips to run MoE workloads efficiently.",
                author: "Zhao Min",
                categoryLabel: "CHIP ARCHITECTURE / INDUSTRY TRENDS"
            },
            de: {
                title: "Der Aufstieg chinesischer KI-Chip-Startups: Innovation unter Sanktionen",
                subtitle: "Wie lokale Halbleiterfirmen ihre Architekturen anpassen, um Einschränkungen zu umgehen.",
                summary: "Trotz strenger Exportkontrollen entwickelt eine neue Generation chinesischer Firmen innovative KI-Beschleuniger.",
                body: "Die Handelsbeschränkungen erweisen sich als zweischneidiges Schwert. Biren Technology und Moore Threads arbeiten an neuen Designs und speziellen Compilern.",
                author: "Zhao Min",
                categoryLabel: "HARDWARE-STRATEGIEN / INDUSTRIE-ANALYSEN"
            }
        }
    },
    {
        id: "7",
        slug: "ai-robotics-startups-shenzhen",
        title: "Shenzhen AI Robotics Boom: 5 Startups Redefining Automation",
        subtitle: "How Shenzhen's hardware supply chain is enabling rapid iteration of embodied intelligence.",
        summary: "From warehouse logistics to surgical assistance, Shenzhen-based startups are combining AI with robotics in groundbreaking ways.",
        body: "Shenzhen’s unparalleled hardware ecosystem is giving rise to a new wave of embodied AI startups. By putting advanced neural networks inside robotic arms and humanoids, these startups iterate at speeds unthinkable in other parts of the world.",
        author: "Sun Jie",
        categoryLabel: "EMBODIED INTELLIGENCE / HARDWARE SYSTEMS",
        publishDate: "2026-05-14",
        readingMinutes: 6,
        coverImage: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&h=675&fit=crop",
        categories: [categories[2], categories[1]],
        isFeatured: false,
        translations: {
            zh: {
                title: "深圳具身智能硬件潮：这五家机器人初创公司正在重新定义自动化",
                subtitle: "解读大湾区硬件供应链速度如何成为人工智能具身化落地的“加速器”。",
                summary: "从仓储物流机器人到高精度的商用仿人实体，深圳强大的电子硬件制造链条让具身智能初创企业能够以惊人的速度迭代产品原型。",
                body: "深圳独一无二的电子元器件供应链和制造网络，正在催生新一波“具身智能（Embodied AI）”初创企业的繁荣。将先进的感知决策算法植入机器人躯壳中，让深圳的创业者能在一周内完成从图纸设计到真机联调的循环。\n\n包括宇树科技、大界机器人等公司，正在工业检测、家庭陪伴、末端配送等场景开展广泛试水，向世界展示了人工智能与精密机械结合的硬实力。",
                author: "孙杰",
                categoryLabel: "具身智能 / 硬件创新"
            },
            en: {
                title: "Shenzhen AI Robotics Boom: 5 Startups Redefining Automation",
                subtitle: "How Shenzhen's hardware supply chain is enabling rapid iteration of embodied intelligence.",
                summary: "From warehouse logistics to surgical assistance, Shenzhen-based startups are combining AI with robotics in groundbreaking ways.",
                body: "Shenzhen’s unparalleled hardware ecosystem is giving rise to a new wave of embodied AI startups. By putting advanced neural networks inside robotic arms and humanoids, these startups iterate at speeds unthinkable in other parts of the world.",
                author: "Sun Jie",
                categoryLabel: "EMBODIED INTELLIGENCE / HARDWARE SYSTEMS"
            },
            de: {
                title: "Der KI-Robotik-Boom in Shenzhen: 5 Startups auf dem Vormarsch",
                subtitle: "Wie Shenzhens Hardware-Lieferketten die Entwicklung verkürzen.",
                summary: "Von der Logistik bis zur Chirurgie: Startups aus Shenzhen kombinieren KI und Robotik.",
                body: "Das Elektronik-Ökosystem von Shenzhen bietet den perfekten Nährboden für die Verschmelzung von KI und physischen Robotern.",
                author: "Sun Jie",
                categoryLabel: "ROBOTIK & EMPOWERMENT / SYSTEMINTEGRATION"
            }
        }
    },
    {
        id: "8",
        slug: "stepfun-multimodal-ai-breakthrough",
        title: "StepFun Multimodal Breakthrough: Video Understanding at Scale",
        subtitle: "How the discrete Beijing team built next-generation multimodal encoders.",
        summary: "The Beijing startup has achieved state-of-the-art results in video understanding, processing hours of footage in seconds.",
        body: "StepFun (阶跃星辰), founded by former Microsoft Vice President Jiang Dali, has quietly achieved major breakthroughs in long-video reasoning. Their models process complex video logic, mapping events across time grids with high accuracy.",
        author: "Huang Lei",
        categoryLabel: "MULTIMODALITY / FOUNDATION LABS",
        publishDate: "2026-05-13",
        readingMinutes: 5,
        coverImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&h=675&fit=crop",
        categories: [categories[4]],
        isFeatured: false,
        translations: {
            zh: {
                title: "阶跃星辰多模态大突破：复杂视频逻辑理解与时间跨度长视频的智能检索",
                subtitle: "前微软副总裁姜大昕带队，揭秘国内领先的万亿参数多模态混合专家架构设计。",
                summary: "阶跃星辰（StepFun）在多模态理解尤其是长视频上下文的关联推理上取得核心进展，能准确捕捉跨时间线的动作脉络。",
                body: "由前微软亚洲研究院副院长姜大昕创办的「阶跃星辰（StepFun）」是国内多模态大模型领域的硬核实力派。在视频逻辑分析和跨事件推理上，其研发的 Step-1.5V 多模态模型展现了极高的感知力。\n\n传统的视频大模型往往只能进行简单的逐帧分析，而阶跃星辰通过多模态融合的跨帧注意力机制，能够理解数小时长视频内的因果链条，这在智能安防、长视频编辑和内容审计等行业具有极高的商业价值。",
                author: "黄磊",
                categoryLabel: "多模态研究 / 基础实验室"
            },
            en: {
                title: "StepFun Multimodal Breakthrough: Video Understanding at Scale",
                subtitle: "How the discrete Beijing team built next-generation multimodal encoders.",
                summary: "The Beijing startup has achieved state-of-the-art results in video understanding, processing hours of footage in seconds.",
                body: "StepFun (阶跃星辰), founded by former Microsoft Vice President Jiang Dali, has quietly achieved major breakthroughs in long-video reasoning. Their models process complex video logic, mapping events across time grids with high accuracy.",
                author: "Huang Lei",
                categoryLabel: "MULTIMODALITY / FOUNDATION LABS"
            },
            de: {
                title: "StepFun Multimodaler Durchbruch: Videoanalyse im großen Maßstab",
                subtitle: "Wie das diskrete Pekinger Team multimodale Encoder der nächsten Generation entwickelte.",
                summary: "Das Startup StepFun erzielt bemerkenswerte Ergebnisse beim Verständnis komplexer Videoinhalte.",
                body: "StepFun (阶跃星辰) hat bedeutende Fortschritte bei der Videoinferenz erzielt, die Kausalität über lange Zeiträume erkennen.",
                author: "Huang Lei",
                categoryLabel: "MULTIMODALITÄT / GRUNDLAGENLABORE"
            }
        }
    }
];

export function getLocalizedCategoryName(category: Category, locale: string): string {
    const activeLocale = locale.toLowerCase();
    const translations: Record<string, Record<string, string>> = {
        zh: {
            "Founder Interviews": "创始人访谈",
            "AI Products & Apps": "AI 产品与应用",
            "AI Hardware & Embodied": "AI 硬件与具身智能",
            "Content, IP & Media": "内容、IP 与媒体",
            "Technical Deep Dives": "技术拆解与实践",
            "Hunt Night & Community": "狩猎夜与社区",
            "Funding & Strategy": "融资与商业策略"
        },
        de: {
            "Founder Interviews": "Gründerinterviews",
            "AI Products & Apps": "KI-Produkte & Apps",
            "AI Hardware & Embodied": "KI-Hardware & Robotik",
            "Content, IP & Media": "Content, IP & Medien",
            "Technical Deep Dives": "Technische Analysen",
            "Hunt Night & Community": "Hunt Night & Community",
            "Funding & Strategy": "Finanzierung & Strategie"
        }
    };
    return translations[activeLocale]?.[category.name] || category.name;
}

export function getLocalizedArticle(article: Article, locale: string): Article {
    const activeLocale = locale.toLowerCase();
    if (article.translations && article.translations[activeLocale]) {
        const trans = article.translations[activeLocale];
        return {
            ...article,
            title: trans.title,
            subtitle: trans.subtitle,
            summary: trans.summary,
            body: trans.body,
            author: trans.author,
            categoryLabel: trans.categoryLabel,
        };
    }
    // Return default (English) if translation doesn't exist
    return article;
}

export function getFeaturedArticle(locale: string = 'en'): Article {
    const raw = articles.find((a) => a.isFeatured) || articles[0];
    return getLocalizedArticle(raw, locale);
}

export function getLatestArticles(count: number = 10, locale: string = 'en'): Article[] {
    return articles.slice(0, count).map((a) => getLocalizedArticle(a, locale));
}

export function getArticlesByCategory(categorySlug: string, locale: string = 'en'): Article[] {
    return articles
        .filter((a) => a.categories.some((c) => c.slug === categorySlug))
        .map((a) => getLocalizedArticle(a, locale));
}

export function getArticleBySlug(slug: string, locale: string = 'en'): Article | undefined {
    const raw = articles.find((a) => a.slug === slug);
    if (!raw) return undefined;
    return getLocalizedArticle(raw, locale);
}

export function getRelatedArticles(article: Article, count: number = 4, locale: string = 'en'): Article[] {
    const categoryIds = article.categories.map((c) => c.id);
    return articles
        .filter(
            (a) =>
                a.id !== article.id &&
                a.categories.some((c) => categoryIds.includes(c.id))
        )
        .slice(0, count)
        .map((a) => getLocalizedArticle(a, locale));
}
