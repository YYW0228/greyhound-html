专注

:root{
  --color-critical:#e53e3e; --bg-critical:#fff5f5;
  --color-warning:#dd6b20; --bg-warning:#fffaf0;
  --color-info:#3182ce;    --bg-info:#ebf8ff;
  --color-success:#38a169; --bg-success:#f0fff4;
  --color-pending:#d69e2e; --bg-pending:#fffff0;
  --color-accent:#3182ce;
  --bg-body:#f7fafc; --bg-card:#fff;
  --color-body:#1a202c; --color-heading:#1a202c;
  --color-secondary:#4a5568; --color-muted:#718096;
  --color-border:#e2e8f0; --bg-secondary:#f7fafc; --bg-code:#edf2f7;
  --font-sans:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
  --content-width:960px;}

/* ===== 语义颜色 ===== */
.critical { border-left:4px solid var(--color-critical, #e53e3e); background:var(--bg-critical, #fff5f5); }
.warning  { border-left:4px solid var(--color-warning, #dd6b20); background:var(--bg-warning, #fffaf0); }
.info     { border-left:4px solid var(--color-info, #3182ce); background:var(--bg-info, #ebf8ff); }
.success  { border-left:4px solid var(--color-success, #38a169); background:var(--bg-success, #f0fff4); }
.pending  { border-left:4px solid var(--color-pending, #d69e2e); background:var(--bg-pending, #fffff0); }

/* ===== 基础 ===== */
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body {
  font-family:var(--font-sans,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif);
  max-width:var(--content-width,960px); margin:0 auto; padding:24px;
  background:var(--bg-body,#f7fafc); color:var(--color-body,#1a202c); line-height:1.7;
  -webkit-font-smoothing:antialiased;
}

/* ===== 标题 ===== */
h1{font-size:2em;margin-bottom:4px;color:var(--color-heading,#1a202c)}
h2{font-size:1.4em;margin:24px 0 12px;padding-bottom:6px;border-bottom:2px solid var(--color-border,#e2e8f0)}
h3{font-size:1.1em;margin:16px 0 8px}
.subtitle{color:var(--color-muted,#718096);font-size:0.95em;margin-bottom:24px}

/* ===== 网格系统 ===== */
.grid-4{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin:16px 0}
.grid-3{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px;margin:16px 0}
.grid-2{display:grid;grid-template-columns:repeat(auto-fill,minmax(380px,1fr));gap:12px;margin:16px 0}

/* ===== 卡片 ===== */
.card,.critical,.warning,.info,.success,.pending{
  padding:16px;background:var(--bg-card,#fff);border:1px solid var(--color-border,#e2e8f0);
  border-radius:10px;box-shadow:0 1px 3px rgba(0,0,0,0.08);margin:12px 0;
}
.card-label{
  font-size:0.8em;color:var(--color-muted,#718096);text-transform:uppercase;
  letter-spacing:0.05em;margin-bottom:2px;
}
.card-value{font-size:1.6em;font-weight:700;margin:2px 0}
.card-desc{font-size:0.9em;color:var(--color-secondary,#4a5568)}

/* ===== 折叠 ===== */
details{margin:8px 0}
details .critical,details .warning,details .info,details .success,details .pending{margin:8px 0}
summary{
  font-weight:600;cursor:pointer;padding:10px 0;
  font-size:1.05em;user-select:none;
}
summary:hover{color:var(--color-accent,#3182ce)}

/* ===== 标签 ===== */
.tag{display:inline-block;padding:2px 10px;border-radius:4px;font-size:0.8em;font-weight:600;margin:2px}
.tag-red{background:var(--bg-critical,#fed7d7);color:var(--color-critical,#c53030)}
.tag-green{background:var(--bg-success,#c6f6d5);color:var(--color-success,#276749)}
.tag-blue{background:var(--bg-info,#bee3f8);color:var(--color-info,#2b6cb0)}
.tag-yellow{background:var(--bg-pending,#fefcbf);color:var(--color-pending,#975a16)}
.tag-purple{background:#e9d8fd;color:#6b46c1}

/* ===== 图表容器 ===== */
.diagram-box{
  background:var(--bg-card,#fff);border:1px solid var(--color-border,#e2e8f0);
  border-radius:10px;padding:20px;margin:16px 0;text-align:center;
}

/* ===== 代码 ===== */
code{
  background:var(--bg-code,#edf2f7);padding:2px 6px;border-radius:4px;
  font-family:'SF Mono','Fira Code',monospace;font-size:0.9em;
}
pre{
  background:#1a202c;color:#e2e8f0;padding:16px;border-radius:8px;
  overflow-x:auto;font-size:0.85em;line-height:1.5;
}
pre code{background:transparent;padding:0;color:inherit}

/* ===== 表格 ===== */
table{width:100%;border-collapse:collapse;margin:12px 0;font-size:0.9em}
th,td{padding:10px 12px;text-align:left;border-bottom:1px solid var(--color-border,#e2e8f0)}
th{background:var(--bg-secondary,#f7fafc);font-weight:600;color:var(--color-secondary,#4a5568)}
tr:hover{background:var(--bg-secondary,#f7fafc)}

/* ===== 引用 ===== */
blockquote{
  border-left:3px solid var(--color-info,#3182ce);margin:12px 0;padding:8px 16px;
  background:var(--bg-info,#ebf8ff);border-radius:0 8px 8px 0;
  font-style:italic;color:var(--color-body,#2d3748);
}

/* ===== 步骤卡片 ===== */
.step{display:flex;gap:16px;align-items:flex-start;margin:12px 0;padding:12px 16px;background:var(--bg-card,#fff);border-radius:8px;border:1px solid var(--color-border,#e2e8f0)}
.step-num{width:32px;height:32px;background:var(--color-accent,#3182ce);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0}

/* ===== 链接 ===== */
a{color:var(--color-accent,#3182ce);text-decoration:none}
a:hover{text-decoration:underline}
img{max-width:100%;height:auto;border-radius:8px;margin:16px 0}

/* ===== 列表 ===== */
ul,ol{padding-left:1.5em;margin:8px 0}
li{margin:4px 0}
strong{font-weight:600}

/* ===== 打印 ===== */
@media print{body{font-size:11pt;background:#fff;color:#000}}
@media(max-width:600px){
  body{padding:16px}
  .grid-4,.grid-3,.grid-2{grid-template-columns:1fr}
  .step{flex-direction:column}
}

# 专注

  
  在某些时候,阅读有关 LLM 的内容已经不够了。 您需要自己构建堆栈:首先使用 Tokenizer,然后是嵌入、位置、注意力、Transformer 块、目标、解码、缓存、长上下文、路由、数据、训练后、服务、评估、工具和对齐 / 安全。
  

  PREMIUM
  REPORT
  2026

## 📊 核心指标速览

  
    核心循环
    6 步
    Token → Transformer → Attention → KV Cache → Decode → Repeat
  
  
    推荐 VRAM
    16-24 GB
    2026 年本地用户最低舒适层
  
  
    量化甜区
    Q4-Q5
    消费级本地部署的最佳权衡
  
  
    关键家族
    6+
    Qwen / Gemma / DeepSeek / Mistral / Kimi / Nemotron
  

## 🔄 推理核心循环

  
    
      
        
      
    
    
    
    📝 文本 → Token
    分词器编码
    
    
    🏗️ Transformer
    嵌入 + 位置编码
    
    
    👁️ Attention
    决定哪些 token 重要
    
    
    💾 KV Cache
    工作内存复用
    
    
    🎯 Decode
    选择 → 采样 → 输出
    
    🔄 重复直到停止条件
    f(θ, sequence) → probability distribution over next_token
  

## 📖 详细分析

在某些时候,阅读有关 LLM 的内容已经不够了。 您需要自己构建堆栈:首先使用 Tokenizer,然后是嵌入、位置、注意力、Transformer 块、目标、解码、缓存、长上下文、路由、数据、训练后、服务、评估、工具和对齐 / 安全。

> 基于项目的路线图,将法学硕士基础知识转变为您可以构建、衡量、分解和解释的工作系统。

目标是从"我理解概念"转变为"我可以构建它" 自 2026 年 5 月起,这意味着要同时学习模型架构、训练循环、推理路径、数据管道、服务层和评估习惯。

# 专注

这是一份项目优先指南。 它从以下机制开始:标记器、嵌入、位置方法、注意力、多头注意力、Transformer 块、训练循环、对象、解码、推测解码、KV 缓存、MQA、GQA、MLA、长上下文、高效注意力和硬件感知建模。

之后,它进入更广泛的系统和研究层:专家混合、稀疏模型权衡、状态空间和线性注意力替代方案、扩散式语言模型、数据管道、合成数据、缩放定律、后训练、RLHF、PPO、GRPO、RLVR、量化、服务堆栈、评估线束、RAG、工具、代理、多模态适配器、可解释性、红队套件和完整的顶点模型系统。

## 原则:每个项目都教授一个来之不易的概念

对于下面的每个项目,遵循相同的循环:

建造它。 在使用库版本之前,请先自己实现核心思想。

充满了。 使 los 曲线、延迟曲线、内存曲线、热图注意力、路由直方图、熵满或故障图库。

打破它。 消融你刚刚建造的东西。 删除正编码。 不幸的因果面具。 量化过于激进。 饿死约会对象。 路由器崩溃。 超载 KV 缓存。

解释一下。 写一个简短的技术说明:您期望什么、发生了什么、什么让您感到惊讶以及您接下来会尝试什么。

运送文物。 存储库、笔记本、博客文章、小型演示、基准图表或可重复的实验胜过模糊的理论。

下面的堆栈从代币移动到系统,然后从系统移动到研究。

# 第一部分:文本成为张量

## 1. 从头开始构建标记器

在训练模型之前,您要决定世界如何成为符号。 该决定影响压缩、多语言行为、稀有单词、代码、数学、表情符号、延迟、上下文使用和模型质量。

## 2. 一热向量、学习到的嵌入和语义几何

令牌 ID 本身没有任何意义。 当 ID 成为向量时,意义就开始了。 构建最简单的嵌入表并在下一个标记目标上学习它。

# 第二部分:位置赋予代币顺序

## 3. 实现正弦、学习、RoPE 和 ALiBi 位置方法

单独注意力是交换不变的。 从本质上讲,"狗咬人"和"人咬狗"看起来太相似了。 最初的 Transformer 使用正弦位置编码；砖系统通常使用学习位置、旋转位置嵌入、ALiBi 或 RoPE 缩放变体。

# 第三部分:注意力使上下文有用

## 4. 一个令牌的手线缩放点产品注意力

在实现 Transformer 块之前,实现对单个查询的关注。 手动计算 Q、K、V。 取点积。 缩放它。 Softmax 它。 使用它来形成值的加权和。

## 5. 将注意力扩展到多头注意力

多头注意力让不同的子空间学习不同的关系模式。 一些负责人可能专门从事本地语法、类似归纳复制、分隔符跟踪或远程依赖关系。

## 6. 构建单个 Transformer 解码器块

现在堆叠各个部分:令牌嵌入、位置方法、掩蔽多头注意力、残差连接、归一化、前馈网络和输出投影。

## 7. 将块堆叠成"迷你成型器"

在玩具文本上训练一个仅限解码器的微型模型。 重点不是构建一个有用的聊天机器人。 重点是了解训练循环。

# 第四部分:目标定义模型所学内容

## 8. 比较因果 LM、掩蔽 LM、前缀 LM 和去噪目标

不同的目标产生不同的能力。 BERT 使用掩码语言建模来构建双向表示。 GPT 风格的模型使用因果下一个标记预测。 T5 将许多 NLP 任务定义为具有去噪目标的文本到文本生成。

# 第五部分:解码将概率转化为文本

## 9. 构建采样仪表板

模型输出逻辑。 产品输出文本。 解码是桥梁。

## 10. 实施推测性解码

自回归解码是连续的:一个令牌取决于前一个令牌。 推测解码通过使用较小的草稿模型来提出由较大模型验证的标记来加速生成。

# 第六部分:KV 缓存和内存绑定推理

## 11. 构建 KV 缓存

在自回归推理过程中,过去的键和值不需要每一步都重新计算。 KV 缓存存储它们。

## 12. 实施 MQA、GQA 并学习 MLA

标准的多头注意力为每个查询头提供了自己的键和值头。 多查询注意力在查询头之间共享密钥和值,以减少内存带宽。

# 第七部分:长上下文是一个系统问题

## 13. 构建滑动窗口注意力和注意力吸收实验

长上下文问题不能通过增加配置文件中的数字来解决。 模型可能会丢失信息、过度关注不相关的标记、在长序列上崩溃或变得服务成本太高。

## 14. 使用 RoPE 缩放、YaRN 风格插值和内存机制扩展上下文

上下文扩展通常结合位置插值、微调、有效注意力和评估。

# 第八部分:高效注意力和硬件感知建模

## 15. 比较朴素注意力、PyTorch SDPA 和 FlashAttention

根据内存访问模式,相同的数学运算可能具有截然不同的运行时间。

## 16. 了解硬件预算:FLOP、带宽、内存和精度

到 2026 年,法学硕士工程将严重受硬件限制。

# 第九部分:专家混合

## 17. 构建双专家路由器

Sparse Mixture-of-Experts 模型可以增加参数数量,而无需激活每个令牌的每个参数。

## 18. 复制现代稀疏模型权衡

最近的前沿和开放权重系统大量使用稀疏激活。 DeepSeek-V3 报告总参数为 671B,每个令牌激活 37B。

# 第十部分:超越香草变形金刚

## 19. 实现玩具状态空间或线性注意力模型

变压器占主导地位,但它们并不是唯一严肃的序列架构。

## 20. 构建扩散式语言模型玩具

自回归生成并不是唯一可能的解码范式。

# 第十一部分:数据是真正的预训练基础

## 21. 构建预训练数据管道

数据质量是堆栈中影响最大的部分之一。

## 22. 合成数据:生成、过滤并证明它有帮助

当合成数据被针对、过滤和诚实评估时,它会有所帮助。

# 第十二部分:规模法律和容量

## 23. 训练微型、小型和中型模型并拟合缩放曲线

缩放定律量化损失如何随模型大小、数据大小和计算而变化。

# 第十三部分:培训后将基础模型转变为助手

## 24. 微调、指令调调和偏好调调

基本模型预测文本。 助手遵循指示。

## 25. 建造玩具 RLHF、PPO、GRPO 和 RLVR 实验室

强化学习对于推理模型变得尤为重要。

# 第十四部分:量化和压缩

## 26. 量化模型并测量损坏

量化不仅仅是"使其变小" 它会改变数值行为、延迟、内存带宽,有时还会改变模型质量。

# 第十五部分:服务系统

## 27. 通过多个推理堆栈为同一模型提供服务

法学硕士服务是一门独立的学科。

# 第十六部分:评估停止猜测

## 28. 建立评估工具

如果你无法测量模型,你就无法改进它。

# 第十七部分:检索、工具和代理作为顶点

## 29. 从头开始构建检索增强生成

RAG 将模型中的参数记忆与外部语料库中的非参数记忆相结合。

## 30. 只有在了解堆栈之后才能构建工具使用和代理循环

特工不是假的,但当被视为魔法时,他们是脆弱的。

# 第十八部分:多模式法学硕士

## 31. 构建一个微型视觉语言适配器

现代 LLM 越来越多地使用文本、图像、音频、视频和结构化工具输出。

# 第十九部分:可解释性和故障模式

## 32. 研究电路、探测器和稀疏自动编码器

机械可解释性试图理解模型内部计算的内容。

## 33. 建立红队和安全评估套件

随着模型能力的提高,安全评估成为工程的一部分。

# 第二十部分:最终顶点构建完整的小型法学硕士系统

## 34. 训练、调整、量化、服务、评估和记录一个模型

您的最终项目应该连接整个堆栈。

# 现实的锁定计划

第 1-2 周:陈述和关注 — 构建标记器、嵌入、位置编码、注意力、掩蔽、多头注意力和单块变压器。

第 3-4 周:培训和目标 — 训练一个微型模型,比较目标,构建采样工具,研究规范化和激活,并运行你的第一个消融。

第 5-6 周:推理系统 — 实现 KV 缓存、MQA/GQA、推测解码、量化和服务基准。

第 7-8 周:长期背景、环境部和数据 — 构建滑动窗口注意力、上下文扩展测试、玩具 MoE 和真实数据管道。

第 9-10 周:培训后和评估 — 运行 SFT、LoRA/QLoRA、DPO、玩具 RL、基准安全带和安全评估。

第 11-12 周:顶点课程 — 训练或微调一个小模型,量化它,提供它,添加 RAG/工具,评估它,对其进行重新组合,并发布完整的文章。

# 每个项目结束后发布什么

对于每个项目,制作五个工件:实现、笔记本、图表、故障图库、简短的文章。

# 心态

不要永远陷入理论困境。 但也不要将演示误认为是理解。

基础知识消除了藏身之处。

然后构建代理。 构建产品。 建立公司。 建立实验室。

但要把它们建在基岩上。 你未来的自己会感谢你。

  **本地 LLM 主要是内存数学 + 格式化 + 评估**

  专注 · PREMIUM · Generated by markdown-to-html