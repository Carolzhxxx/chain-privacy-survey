# 研究设计说明：人际隐私的多跳传播（Multi-hop Interpersonal Privacy Propagation）

> 本文档依据问卷当前实现（`src/config/`、`src/components/survey/screens/`、`src/lib/`、`server/index.js`）整理，可用于论文 Method 部分、伦理审查（IRB）材料或与导师沟通。文中题目措辞均直接摘自代码配置。标注 **【待填写】** 的内容在代码中没有，需要研究者补充；标注 **【建议】** 的内容属于分析建议，并非问卷已实现的功能。
>
> 当前代码状态：`STUDY_MODE = 'pilot'`，`INCLUDE_REASONING_PROBES = true`。

---

## 1. 研究目的与研究问题

本研究考察：一条关于参与者本人的私人信息，在没有获得明确许可的情况下沿人际链条逐级传播（A → B → C → D）时，参与者对每一级“知情”的可接受度（acceptability）如何变化，以及这种判断受哪些因素影响。参与者始终扮演信息所有者 A；B、C、D 为情境中的假想人物。

以下研究问题是根据问卷结构推断出来的，**【待填写/确认】**：

- **RQ1（传播距离）**：随着信息从 B 传到 C、再传到 D，参与者的可接受度是否发生系统性变化（比如逐级下降）？
- **RQ2（所有者与接收者的关系）**：A 与每位接收者（B、C、D）之间的关系（陌生人 / 朋友 / 家人）如何影响该接收者知情时的可接受度？
- **RQ3（传播路径上的关系）**：转述者与接收者之间的关系（B–C、C–D）是否会在 A 与接收者关系之外，额外影响可接受度？
- **RQ4（信息敏感度）**：参与者主观评定的信息敏感度如何影响各级可接受度，以及可接受度随传播距离的变化？
- **RQ5（判断依据）**：参与者主要依据“最终是谁知道了”（结果，recipient outcome），还是依据“信息由谁、经过什么过程传播”（过程，sharing process）来作判断？

---

## 2. 实验设计

### 2.1 总体设计

本研究为匿名在线情境问卷（vignette-based online survey），提供中英双语（默认英文，被试可随时切换中文 / English，已作答内容不丢失）。

- **被试内（within-subjects）**：传播阶段（hop）有 3 个水平，分别是 A→B（B 知情）、A→B→C（C 知情）、A→B→C→D（D 知情）。每位被试在每个情境中按固定顺序评定这三个阶段。
- **被试间（between-subjects）**：
  - 信息条目：由系统从 18 条信息中分配（见第 3 节）；
  - 关系结构：五对关系各自独立随机分配（见下表）。
- **固定条件（本轮不操纵）**：B 没有获得继续分享的明确许可（`permission_condition = "not_authorized"`）；C 和 D 此前都不知道这条信息（`c_prior_knowledge = d_prior_knowledge = false`）。这两点在情境叙述中有明确说明。

### 2.2 关系因素与水平

五对关系全部由系统分配，只呈现给被试，被试不能自行选择。

| 因素 | 含义 | 水平 |
|---|---|---|
| A–B（`owner_b_relation_condition`） | 您与 B 的关系 | 陌生人 stranger / 朋友 friend / 家人 family |
| A–C（`owner_c_relation_condition`） | 您与 C 的关系 | 同上 |
| A–D（`owner_d_relation_condition`） | 您与 D 的关系 | 同上 |
| B–C（`bc_relation_condition`） | 转述者 B 与接收者 C 的关系 | 同上 |
| C–D（`cd_relation_condition`） | 转述者 C 与接收者 D 的关系 | 同上 |

五个因素组合起来共有 3⁵ = 243 种关系结构（记为 `relationship_structure_id`）。设计只保证每个因素各自的水平分布均衡，**不保证 243 个组合单元格各自均衡**（见第 4 节），因此本设计不是完全析因的单元格设计。

各水平向被试呈现的文字如下（`{person}` 为 C 或 D，`{sender}` / `{recipient}` 为转述者和接收者）：

- **A 与某人的关系**：
  - 陌生人：“您此前不认识{person}，也从未与{person}有过直接接触。”
  - 朋友：“{person}是您的一位朋友。”
  - 家人：“{person}是您的一位家人。”
- **路径上两人的关系**：
  - 陌生人：“{sender}与{recipient}此前互不认识，也从未有过直接接触。”
  - 朋友：“{recipient}是{sender}的一位朋友。”
  - 家人：“{recipient}是{sender}的一位家人。”

### 2.3 Pilot 与 Formal 两种模式

| | Pilot（当前设置） | Formal |
|---|---|---|
| 每人情境数（`SCENARIOS_PER_PARTICIPANT`） | 1 | 2 |
| 信息条目 | 1 条 | 2 条，来自不同类别 |
| 情境呈现顺序 | — | 按被试随机（种子由参与者编号派生，可复现） |
| 关系结构 | 1 套 | 1 套，两个情境共用，只更换信息条目 |
| 人物 B/C/D 页面 | 1 次 | 只在第一个情境的敏感度评定之后出现 1 次 |

在 Formal 模式下，每个情境都有各自的敏感度评定、三个阶段的可接受度评定、开放式追问和真实感评定。信息条目因此在被试内也有变异，同一被试的两个情境之间只有信息不同。

开放式理由追问及判断因素题（`INCLUDE_REASONING_PROBES`）在两种模式下目前都保留。代码注释说明，是否在正式研究中保留这些题目要等 pilot 结果再决定。关闭这些题目不影响核心评分题。

---

## 3. 情境材料

### 3.1 角色说明

情境摘要卡中的角色说明如下：

- **A**：您本人——信息的所有者
- **B**：第一位知道您这条信息的人
- **C**：通过 B 知道这条信息的人
- **D**：通过后续传播知道这条信息的人

背景页的说明文字是：“在本研究中，您将阅读一个假想的信息传播情境。您是信息所有者 A；B、C、D 是情境中的假想人物，不对应您现实生活中的任何人。”

### 3.2 情境叙述（`SCENARIO_NARRATIVE`）

所有被试、所有信息条目使用同一段叙述：

> 中文：您将这条信息告诉了B，但没有明确允许B继续分享。之后，B将该信息告诉了原本不知道此事的C；该信息随后继续传播，并最终被原本不知道此事的D知道。
>
> English: You told B this information, but did not explicitly allow B to share it further. Later, B told C, who did not know about it before; the information then kept spreading and eventually became known to D, who also did not know about it before.

需要注意，叙述只说信息“继续传播”后到达 D，并没有明确写“由 C 告诉 D”。不过 D 阶段的评分题写的是“经过 B 和 C 的转述，最终被 D 知道”，人物 D 页面也呈现了 C–D 关系。

从背景页开始，每个评分页面顶部都有一张**情境摘要卡**，内容包括：

- 角色说明；
- 五对关系的摘要（悬停或点击可以看到完整描述）；
- 上述叙述；
- 信息条目；
- 当前传播路径图（箭头上标注关系）；
- 当前评分对象。

### 3.3 信息条目池（`INFORMATION_ITEM_POOL`）

信息池共 18 条，分为 6 类、每类 3 条。呈现每条信息前，都有同一段引导语：

> 请想象以下信息描述的是您本人。这只是一个假想情境，您不需要提供任何真实的个人信息。
> （Please imagine that the following information describes you. This is a hypothetical scenario, and you do not need to provide any real personal information.）

类别名称**从不向被试显示**。条目也没有预设敏感度高低，敏感度只来自被试本人的 1–7 评分。

| 类别 | 条目 ID | 中文原文 | English |
|---|---|---|---|
| 健康 health | `health_mental_health_counseling` | 您最近正在接受心理健康方面的咨询。 | You have recently been receiving counseling for a mental health concern. |
| 健康 health | `health_chronic_condition` | 您最近被诊断出一种需要长期管理的慢性健康问题。 | You were recently diagnosed with a chronic health condition that requires ongoing management. |
| 健康 health | `health_prescription_medication` | 您正在为一项持续的健康问题服用处方药。 | You are taking prescription medication for an ongoing health condition. |
| 财务 financial | `financial_personal_debt` | 您目前有一笔尚未偿还的个人债务。 | You currently have an outstanding personal debt. |
| 财务 financial | `financial_account_balance` | 您个人银行账户目前的余额。 | The current balance of your personal bank account. |
| 财务 financial | `financial_payment_difficulty` | 您最近难以按时支付一项日常账单。 | You recently had difficulty paying one of your regular bills on time. |
| 观点与偏好 beliefs_preferences | `beliefs_controversial_social_view` | 您对一项具有争议的社会议题持有一个不愿公开表达的观点。 | You hold a view on a controversial social issue that you do not wish to express publicly. |
| 观点与偏好 beliefs_preferences | `beliefs_political_preference` | 您私下支持的政治候选人或政治立场。 | The political candidate or political position that you privately support. |
| 观点与偏好 beliefs_preferences | `beliefs_religious_spiritual_view` | 您不愿在公开场合讨论的宗教或精神信仰。 | A religious or spiritual belief that you prefer not to discuss publicly. |
| 位置与活动 location_activity | `location_current_realtime` | 您独自外出时的实时位置。 | Your real-time location while you are out alone. |
| 位置与活动 location_activity | `location_recent_history` | 您过去一周去过哪些地点的详细记录。 | A detailed record of the places you visited during the past week. |
| 位置与活动 location_activity | `location_future_plan` | 您明天计划独自前往的地点和具体时间。 | The place and specific time of an outing that you plan to make alone tomorrow. |
| 身份与联系方式 identity_contact | `identity_home_address_phone` | 您的家庭住址和私人电话号码。 | Your home address and personal phone number. |
| 身份与联系方式 identity_contact | `identity_email_birthdate` | 您的个人电子邮箱地址和出生日期。 | Your personal email address and date of birth. |
| 身份与联系方式 identity_contact | `identity_government_id` | 您的政府签发身份证件号码。 | The number on your government-issued identification document. |
| 人际关系与亲密生活 relationships_intimate | `relationships_serious_conflict` | 您与一位亲近的人最近发生了一次严重矛盾。 | You recently had a serious conflict with someone close to you. |
| 人际关系与亲密生活 relationships_intimate | `relationships_possible_breakup` | 您正在考虑结束一段亲密关系，但尚未告诉对方。 | You are considering ending an intimate relationship but have not yet told the other person. |
| 人际关系与亲密生活 relationships_intimate | `relationships_private_family_disagreement` | 您家庭内部最近发生的一次不希望外人知道的分歧。 | A recent disagreement within your family that you do not want outsiders to know about. |

---

## 4. 随机化与平衡

### 4.1 信息条目：随机区组平衡分配（randomized-block balanced assignment）

信息条目的分配规则如下：

1. **区组**：每个区组（block）包含全部 18 条信息各一次，用该区组的随机种子打乱顺序。
2. **队列**：区组依次追加到服务器上的一个共享队列（`data/item_assignment_state.json`）。每位新被试按顺序取下一条（Pilot）。队列用完时自动生成新区组。
3. **Formal 模式**：被试先取队首的一条，再按队列顺序取第一条与已取条目**类别不同**的信息。被跳过的条目留在队首，留给下一位被试，所以不会丢失条目，各条目和各类别的次数保持均衡。README 举例：360 名 formal 被试时，每条信息恰好出现 40 次，每类恰好出现 120 次。
4. **呈现顺序**：Formal 模式下两个情境的呈现顺序用参与者编号派生的种子随机打乱。导出数据中，`scenario_index` 是抽取顺位，`scenario_order` 是呈现位置。
5. **其他保证**：同一被试不会重复拿到同一条信息；被试看不到类别。

### 4.2 关系结构：按因素独立的区组随机（per-factor balanced block randomization）

关系结构的分配规则如下：

1. 五个关系因素各有一个**独立队列**和独立的随机种子（`data/relationship_assignment_state.json`）。
2. 每个区组包含 3 个水平（stranger / friend / family）各一次，随机排序。
3. 每位被试从五个队列中各取下一个水平，组成一套关系结构。

由此可以保证：

- 每个因素的三个水平出现频率均衡（每 3 名被试为一个完整区组）；
- 五个因素之间彼此独立；
- 关系分配也独立于信息条目的分配（两套队列互不相关）。

**243 种组合不做逐格平衡。** 每位被试只有一套关系结构，Formal 模式下两个情境共用这套结构。

### 4.3 锁定与防重抽

分配一旦生成就被锁定：

- 服务器把每位被试的分配写入 `data/participant_assignments/<participant_id>.json`。同一 `participant_id` 再次请求时，直接返回已保存的分配（`reused: true`）。
- 前端在当前浏览器标签页（`sessionStorage`）中保存进度和分配。因此**刷新页面或返回上一页都不会重新随机**。
- 新开一个标签页会被视为一名新的匿名被试。

### 4.4 无后端演示版

无后端演示版（GitHub Pages）中，分配由参与者编号加固定盐值生成种子，每个编号的结果可复现（`assignment_method = "seeded_participant"`）。这种方式**没有跨被试的平衡**，演示版也不收集数据。正式数据收集使用服务器端分配（`assignment_method = "server_block"`）。

---

## 5. 研究流程（逐页）

Pilot 模式（开启追问）共 20 个页面，页面顶部有进度条。每页答完才能进入下一页，被试可以返回上一页修改。

1. **知情同意（consent）**：研究说明，以及两项必选勾选（见第 8 节）。
2. **一般隐私倾向（baseline）**：年龄、性别、3 道一般隐私态度题和 1 道注意力检查题。
3. **实验背景与角色（chain_intro）**：角色说明、情境摘要卡（不含信息条目），以及流程说明：“接下来，您会看到一条具体的、关于您的假想信息，并评价 B、C、D 分别知道这条信息时，您在多大程度上可以接受。” Formal 版的说明则写明会依次看到两条信息，且“两次情境中的人物和关系保持不变”。
4. **信息内容（info）**：引导语和分配到的信息条目。
5. **信息敏感度（sensitivity）**。
6. **人物 B（person_b）**：呈现 A–B 关系。如果 A 认识 B，评定亲密度；无论认识与否，都评定对 B 的信任。
7. **人物 C（person_c）**：呈现 A–C 和 B–C 关系。如果 A 认识 C，评定亲密度。
8. **人物 D（person_d）**：呈现 A–D 和 C–D 关系。如果 A 认识 D，评定亲密度。
9. **理解检查（comprehension）**：3 道关于情境设定的单选题（见 6.2）。此时被试已看过具体信息、完整情境和全部关系。本页不显示情境摘要卡，可返回上一页（人物 D 页，顶部有摘要卡）重读；答错需改正后才能继续。
10. **第 1/3 阶段：您 (A) → B**，即 B 知情的可接受度。
11. **第 2/3 阶段：您 (A) → B → C**，即 C 知情的可接受度。
12. *关于 C 的评分理由*（开放题）。
13. *B 与 C 的比较*（开放题）。
14. **第 3/3 阶段：您 (A) → B → C → D**，即 D 知情的可接受度。
15. *关于 D 的评分理由*（开放题）。
16. *C 与 D 的比较*（开放题）。
17. *影响判断的因素*（多选，最多 3 项）。
18. *主要判断依据*（三项排序）。
19. **情境的真实感（realism）**：最后一个情境的这一页上，按钮为“提交”。
20. **完成（completion）**：感谢语和匿名参与者编号。

斜体为推理追问（reasoning probes），只在 `INCLUDE_REASONING_PROBES = true` 时出现。所有开放题都排在封闭式的因素题和依据题之前。

Formal 模式下，第 4–5 页和第 10–19 页对第二条信息重复一次（页面标注“情境 2 / 2”）。第 6–8 页的人物页面和第 9 页的理解检查只出现一次，最后一个情境的真实感页提交问卷。

各题的选项顺序和题目顺序都是固定的。代码中有一个题目顺序随机化开关（`ENABLE_SECONDARY_RANDOMIZATION`），目前关闭，而且只作用于本轮已隐藏的旧题目。

---

## 6. 测量指标

除特别说明外，所有量表均为 **1–7 点**。评分页使用紧凑量表，只标注 1、4、7 三个锚点；基线页的每个点都有文字标签。

### 6.1 一般隐私倾向（基线，第 2 页，每人一次）

这一组题使用 7 点同意度量表：1 非常不同意、2 不同意、3 有点不同意、4 中立、5 有点同意、6 同意、7 非常同意。

| 变量 | 题目（中文 / English） |
|---|---|
| `privacy_control` | 总体来说，我希望能掌控谁可以获得关于我的信息。/ Generally, I prefer to have control over who receives information about me. |
| `permission_preference` | 总体来说，我希望别人在把关于我的信息告诉他人之前，先征求我的同意。/ Generally, I expect people to ask before sharing information about me with others. |
| `sharing_comfort`（反向计分） | 总体来说，关于我的信息从我最初告诉的那个人那里继续传开，我能够接受。/ Generally, I am comfortable with information about me spreading beyond the person I originally told. |
| `attention_check` | 为确认您在认真作答，请选择 4。/ To show that you are paying attention, please select 4. |

由这一组题派生的变量（在导出时计算）：

- `general_privacy_concern`：三题均值，其中 `sharing_comfort` 按 8 − x 反向计分。注意力检查题不计入。由于这三题不是经过验证的 IUIPC 版本，代码特意没有把它称为 IUIPC。
- `attention_check_passed`：选择 4 即为通过。

### 6.2 理解检查（第 9 页，人物 D 之后、首次评分之前，每人一次）

在开始评分前检查被试是否读懂了固定的情境设定。三题均为单选，选项顺序固定：

| 题目 | 选项 | 正确答案 |
|---|---|---|
| 在这个情境中，您是否允许 B 把这条信息告诉别人？/ In this scenario, did you allow B to tell this information to others? | 允许 / 没有明确允许 / 情境中没有提到 | 没有明确允许（`not_allowed`） |
| C 是从谁那里知道这条信息的？/ From whom did C learn this information? | 直接从我这里 / 从 B 那里 / 从 D 那里 | 从 B 那里（`from_b`） |
| 在 B 告诉 C 之前，C 是否已经知道这条信息？/ Before B told C, did C already know this information? | 已经知道 / 不知道 / 情境中没有提到 | 不知道（`did_not_know`） |

处理方式：被试点“下一页”时判分。答错的题会显示“回答不正确”和对应的情境说明，被试必须改正后才能继续，因此后续评分都建立在正确理解之上。

导出变量：

- `comprehension_first_permission / _path / _prior`：第一次提交时的答案；
- `comprehension_first_*_correct`：第一次是否答对；
- `comprehension_attempts`：提交次数（三题都作答后点“下一页”算一次）；
- `comprehension_passed_first_try`：第一次是否三题全对，可作为排除或敏感性分析的依据。

### 6.3 人口学变量（第 2 页）

- **年龄** `age`：数字输入，必填，范围 18–120。
- **性别** `gender`：必填，选项为女性 / 男性 / 非二元性别 / 其他（请说明）。选“其他”时需填写 `gender_self_describe`，输入框旁会提示不要填写可识别身份的信息。

### 6.4 信息敏感度（每个情境一次，看到信息之后）

- `sensitivity_raw` / `information_sensitivity`：“如果这条信息是关于您的，您认为它有多敏感？”（If this information were about you, how sensitive would it be to you?）
- 锚点：1 完全不敏感、4 中等敏感、7 极其敏感。
- 导出时另附 `sensitivity_norm = (raw − 1) / 6`。

### 6.5 人物关系页（每人一次，在第一个情境的敏感度评定之后）

各页先呈现由系统分配的关系文字：B 页为“您与B”；C 页为“您与C”“B与C”；D 页为“您与D”“C与D”。

**亲密度** `R_AB_raw` / `R_AC_raw` / `R_AD_raw`（场景导出中为 `r_ab` / `r_ac` / `r_ad`）：

- 题目：“根据上述情境，您认为自己与{B/C/D}的关系有多亲近？”（Based on the scenario above, how close do you think you are to {person}?）
- 锚点：1 完全不亲近、4 一般、7 非常亲近。
- **只在 A 认识此人时询问**，即关系为朋友或家人时。关系为陌生人时不呈现该题，值为 `null`，`knows_ab` / `knows_ac` / `knows_ad` 为 `false`。代码特别说明：`null` 表示“不适用”，与“认识但评 1 分”不同。
- 这些评分是被试的主观感知，可用作操纵检验或探索性连续变量。实验操纵本身是分配的关系条件。

**对 B 的信任** `trust_B`：

- 题目：“您对 B 的信任程度如何？”（How much do you trust B?）
- 锚点：1 完全不信任、4 一般或不确定、7 完全信任。
- 只在 B 页出现，**无论 A–B 关系如何都会询问**。

B–C、C–D 两对关系的亲密度**本轮不询问**（`r_bc` / `r_cd` 恒为 `null`），分析中使用分配的条件。

### 6.6 各阶段可接受度（核心因变量，每个情境 3 次）

三个阶段使用相同的量表，锚点为：1 完全不可接受、4 中立或不确定、7 完全可以接受。

| 变量 | 页面 | 题目（中文 / English） |
|---|---|---|
| `acceptability_ab`（hop 1） | 您 (A) → B | 在上述情境中，B 知道了关于您的这条信息。您认为这件事在多大程度上可以接受？/ In the scenario above, B learned this information about you. To what extent do you find this acceptable? |
| `acceptability_abc`（hop 2） | 您 (A) → B → C | 在上述情境中，B 将关于您的信息告诉了 C。您认为这件事在多大程度上可以接受？/ In the scenario above, B told C this information about you. To what extent do you find this acceptable? |
| `acceptability_abcd`（hop 3） | 您 (A) → B → C → D | 在上述情境中，关于您的信息经过 B 和 C 的转述，最终被 D 知道。您认为这件事在多大程度上可以接受？/ In the scenario above, the information about you was passed on by B and C and eventually became known to D. To what extent do you find this acceptable? |

三个阶段按固定顺序呈现，被试可以返回修改之前的评分。

### 6.7 开放式理由追问（每个情境；开启追问时）

**C 和 D 评分后的理由**（`reason_abc_open`、`reason_abcd_open`）：页面会重述该阶段内容，并显示被试刚才的评分（如“您刚才的评分：5（1 = 完全不可接受，7 = 完全可以接受）”）。页面标题即为问题（“关于 C 的评分理由”/“Why this rating for C?”，D 同理），输入框内提示为“请说明您作出这一判断时主要考虑了什么……”（Please describe what you mainly considered when making this judgment…）。

**B 与 C 的比较**（`reason_b_c_difference_open`，紧接在 C 的理由之后）和 **C 与 D 的比较**（`reason_c_d_difference_open`，紧接在 D 的理由之后）：页面先显示两个分数，再给出一句只陈述差异、不作解释的说明（如“您对 C 的评分高于 B。”/“低于 B。”/“您对 B 和 C 给出了相同的评分。”）。题目分别为：

> 与 B 知道这条信息相比，您对 C 知道这条信息的可接受度评分为什么更高、更低或保持不变？
> （Compared with B knowing this information, why was your acceptability rating for C knowing it higher, lower, or the same?）

> 与 C 知道这条信息相比，您对 D 知道这条信息的可接受度评分为什么更高、更低或保持不变？
> （Compared with C knowing this information, why was your acceptability rating for D knowing it higher, lower, or the same?）

所有开放题的作答要求：

- 长度为 5–500 字符；
- 输入框旁提示：“请不要填写姓名或任何可识别身份的信息。”

注意：本轮**没有**对 B 阶段（A→B）的开放式理由追问。

### 6.8 判断因素与主要判断依据（每个情境一次；开启追问时）

**影响判断的因素** `judgment_factors`：

- 题目：“以下哪些因素影响了您刚才的判断？请选择最多三项。”
- 必须选 1–3 项。
- 导出时为 JSON 列表，另附每个选项的 0/1 列 `factor_*`。

| 值 | 选项 |
|---|---|
| `information_sensitivity` | 这条信息本身的敏感程度 |
| `relationship_with_recipient` | 我与最终知情者 C 或 D 的关系 |
| `shared_without_permission` | B或C在没有获得我许可的情况下继续分享了信息 |
| `path_relationships` | B 与 C 或 C 与 D 之间的关系 |
| `number_of_retellings` | 信息经过了多少次转述 |
| `number_of_people_knowing` | 已经有多少人知道这条信息 |
| `appropriateness_of_sharing` | 分享行为本身是否合适 |
| `other` | 其他（需填写 `judgment_factors_other`，最多 300 字符） |

**主要判断依据（排序）** `judgment_basis_ranking`：

- 题目：“以下几方面对您作出判断的重要程度如何？请从最重要的开始，依次点击进行排序。”（再次点击可取消该项排序）
- 三项必须全部排序：
  - `recipient_outcome`：最终是谁知道了我的信息
  - `sharing_process`：信息是由谁、通过什么过程传播的
  - `information_sensitivity`：信息本身是否敏感
- 导出：`judgment_basis_ranking`（按重要性排列的 JSON 列表），`basis_rank_recipient_outcome` / `basis_rank_sharing_process` / `basis_rank_information_sensitivity`（各项名次 1–3）；`primary_judgment_basis` 保留，等于排第 1 的一项。
- 选填补充：“您是否还考虑了其他方面？”（`primary_judgment_basis_other`，最多 300 字符）。
- 与上一版相比，去掉了“上述两方面同样重要”和“其他”两个单选项。

### 6.9 情境真实感（每个情境一次，情境末尾）

- `scenario_realism`：“您认为上述情境在现实生活中发生的可能性有多大？”（How likely do you think it is that the scenario above would happen in real life?）
- 锚点：1 完全不可能、4 有一定可能、7 非常可能。
- 这道题测量的是情境在现实中发生的**可能性**，而不是“真实感”量表（代码中另有一套“完全不真实—非常真实”的锚点，但本题没有使用）。

### 6.10 过程数据

系统还记录以下过程数据：

- 每个页面的进入时间和离开时间（`screen_start_times` / `screen_end_times`；场景导出中为各步骤的 `*_started_at` / `*_ended_at`）；
- 总时长 `duration_seconds`；
- 提交时的界面语言 `survey_language`（en / zh）；
- 信息条目在呈现时的语言和原文（`information_item_language` / `information_item_text`）。

---

## 7. 数据记录与导出

### 7.1 存储

每位被试由系统自动生成随机匿名编号（UUID）。数据存储方式如下：

- 每完成一页，前端都会把当前进度作为**草稿**保存到服务器（`status = "in_progress"`）。
- 提交后，记录标记为 `completed`。
- 同一编号不能重复提交。
- 应答以 JSON 文件形式存放在 `data/sessions/`。

### 7.2 导出

所有导出需要令牌（`x-export-token`），并且**只包含已完成的问卷**：

- **场景表 Scenario CSV**（`/api/export/scenarios.csv`）：每个被试 × 情境一行（Pilot 每人 1 行，Formal 每人 2 行），每列一个变量。包括：
  - 信息条目和类别；
  - 敏感度；
  - 五个关系条件、`relationship_structure_id`、各因素的分配种子；
  - `knows_*`、`r_ab` / `r_ac` / `r_ad`；
  - 固定条件；
  - 三个可接受度评分；
  - 四道开放题，以及判断因素（列表、计数和 one-hot）和主要依据排序；
  - 真实感；
  - 人口学变量、`general_privacy_concern`、`attention_check_passed`、理解检查变量；
  - 分配元数据和各步骤时间戳。
- **长表 Long CSV**（`/api/export/long.csv`）：每个情境的每个阶段一行（每情境 3 行），适合多层模型。主要变量包括：
  - `hop`（1/2/3）、`recipient`（B/C/D）、`acceptability`；
  - `sensitivity_raw` / `sensitivity_norm`、`info_type`；
  - `owner_recipient_relation_condition`（A 与该接收者的关系）和 `sender_recipient_relation_condition`（转述者与接收者的关系；hop 1 中两者都是 A–B 条件）；
  - `owner_knows_recipient`、`relationship_owner_recipient_raw` / `_norm`；
  - 基线态度变量和全部关系条件列。
- **宽表 Wide CSV**（`/api/export/wide.csv`）：每位被试一行。包含基线、人口学、人物页评分、关系条件；每个情境的数据以 JSON 形式放在 `rounds` 列中。
- **分配计数**（`/api/assignment-counts`）：各条目、类别、关系因素水平和关系结构的已分配次数，以及当前队列状态，用于监控平衡。

### 7.3 保留但本轮隐藏的字段

以下字段为兼容旧版本而保留，本轮恒为空：

- 各阶段的 `violation`、`permission`、`perceived_share_probability`、`realism`；
- `B_relationship_type`、`C/D_relationship_type_owner`、`D_already_knows`；
- `r_bc` / `r_cd`（及 `_unsure`）；
- 旧版总体评价页字段（`overall_*`、`perceived_control`、`cumulative_impact`、`optional_comment`）。

分析时可以忽略这些字段。

---

## 8. 隐私与伦理

### 8.1 知情同意

知情同意页包含以下内容：

- 研究题目“人际隐私的多跳传播研究”；
- 研究机构“研究团队”（**【待填写】**真实机构名称）；
- 研究形式“匿名在线问卷”；
- 研究内容；
- 参与方式：阅读假想情境，评价关于自己的信息被不同人物知道时的可接受程度，不需要填写真实姓名或披露现实中的具体隐私；
- 隐私保护提示：不要填写本人或他人的姓名、电话、邮箱、用户名、住址等可识别信息，情境中的信息均为假想；
- 自愿参与，可随时停止，无需理由；
- 数据使用：匿名评分用于研究分析，系统自动生成匿名编号。

被试必须勾选“我已年满 18 周岁”和“我已理解上述说明，并同意参与本研究”两项才能继续。

### 8.2 不收集身份信息

问卷不询问姓名或任何联系方式，参与者编号为随机 UUID。服务端代码只保存应答内容，没有记录 IP 地址的逻辑。人口学信息只有年龄和性别。

### 8.3 自由文本风险控制

所有开放式输入框旁都有提示：“请不要填写姓名或任何可识别身份的信息。”涉及的输入框包括理由题、比较题、“其他”说明和性别自述。理由题限 500 字符，“其他”说明限 300 字符。

### 8.4 情境材料的假想性

情境材料多次强调“假想”：B、C、D 不对应现实中的任何人，被试只需想象信息描述的是自己，不需要提供真实信息。部分条目涉及心理健康、债务、亲密关系等敏感话题，可能引起轻度不适。**【待填写】**是否需要在同意书中提示这一点，并提供支持资源。

### 8.5 数据访问

导出接口需要令牌。**【待填写】**数据保存期限、存储位置（服务器）、访问人员和销毁计划。

### 8.6 中途退出的数据

由于每页都会保存草稿，**中途退出者的部分作答也会留在服务器上**（`in_progress`）。导出时不包含这部分数据，但文件仍然存在。**【待填写】**如何在同意书中说明这一点，以及是否删除这些数据。

---

## 9. 建议的分析方向【建议，非问卷已实现功能】

1. **主要模型**：以长表为基础，以 `acceptability`（1–7）为因变量，拟合混合效应模型（linear mixed model 或有序 cumulative link mixed model, CLMM）：
   - 固定效应：`hop`（被试内）、A 与接收者的关系条件、路径关系条件（B–C、C–D）、`sensitivity`（被试内中心化或标准化）、`general_privacy_concern`；
   - 随机效应：被试随机截距，信息条目（`information_item_id`）随机截距；
   - 年龄和性别作为控制变量。
2. **主效应与交互**：
   - hop 的主效应：可接受度是否随传播距离下降；
   - 关系条件的主效应；
   - hop × 敏感度：敏感信息是否随传播距离下降得更快；
   - 路径关系在 A–接收者关系之外的增量效应。
3. **路径关系参数**：README 指出 δ、λ、β_bc、β_cd 等参数**只在分析阶段估计**，前端不计算，也不向被试呈现。仓库中**没有给出这些参数的具体模型公式**。从命名推测，β_bc / β_cd 可能对应 B–C、C–D 路径关系的效应，δ / λ 可能与逐跳衰减相关，但这只是推测。**【待填写】**研究者需要补充具体的模型形式。
4. **操纵检验**：比较朋友和家人条件下 `r_ab` / `r_ac` / `r_ad` 的差异。陌生人条件的亲密度为“不适用”（`null`）。如果需要连续的网络亲密度变量，可以在分析时派生，例如 `knows_ac == false ? 0 : (r_ac − 1) / 6`（README 中的示例）。
5. **探索性分析**：
   - `trust_B` 对 `acceptability_ab` 及后续阶段的预测作用；
   - 各类别和各条目在敏感度上的差异；
   - 真实感作为协变量或敏感性分析。
6. **质性分析**：对四道开放题做主题编码（thematic analysis），并与判断因素多选题和主要依据排序对照，回应 RQ5（结果导向还是过程导向）。
7. **数据质量与排除**：**【待填写】**预注册排除标准，例如注意力检查未通过、理解检查第一次未全对（`comprehension_passed_first_try = false`）、总时长过短、开放题无意义作答等。
8. **样本量**：**【待填写】**。为使区组完整，Pilot 可以取 18 的倍数（信息条目区组），同时它也是 3 的倍数（关系因素区组）。Formal 模式下，README 给出的 360 人示例可以让每条目恰好出现 40 次。

---

## 10. 当前局限与待定事项

1. **Pilot 与 Formal 尚未定稿**：当前为 `pilot`。正式研究是否保留开放式追问（`INCLUDE_REASONING_PROBES`）要等 pilot 结果决定。切换 `STUDY_MODE` 会让另一模式下正在进行的标签页会话失效。
2. **关系组合不逐格平衡**：243 种结构只保证各因素边际均衡，样本量有限时部分组合可能缺失。分析应把各因素作为主效应（可加少量预设交互），而不是比较单元格。
3. **分配发生在页面加载时**：代码在被试打开问卷（同意页）时就请求并锁定分配，而不是在同意之后。未同意或中途退出的被试同样占用队列，所以**平衡是对“被分配者”而言的，完成者之间可能不完全均衡**。建议用 `/api/assignment-counts` 和完成数据监控。
4. **固定条件未操纵**：许可（未授权）和 C/D 事先不知情两项本轮固定，结论不能推广到“已授权”或“接收者已知情”的情形。
5. **叙述与 D 阶段措辞略有差异**：叙述写的是“继续传播……最终被 D 知道”，D 阶段题目写的是“经过 B 和 C 的转述”。**【待确认】**是否需要统一。
6. **阶段顺序固定**：B → C → D 顺序固定，且被试可以返回修改，可能存在顺序效应或锚定效应。这符合传播的时间顺序，但应在论文中说明。
7. **B 阶段没有理由追问**：开放题只覆盖 C、D 阶段和 C–D 比较。
8. **B–C、C–D 亲密度未测**：只能使用分配的条件，无法做这两对关系的操纵检验。
9. **基线量表未经验证**：三道一般隐私题不是经过验证的量表，代码中也没有称其为 IUIPC。如果需要信效度报告，**【待确认】**是否改用已验证的量表。
10. **同意书信息不完整**：缺少真实机构、研究者联系方式、预计用时、报酬、伦理批件编号、数据保存期限、中途退出数据的处理方式、敏感话题提示等，均为 **【待填写】**。
11. **招募平台与报酬**：**【待填写】**（如 Prolific、问卷星、校内招募等），以及纳入和排除条件。
12. **双语等价性**：中英文本由研究者自行编写，没有回译（back-translation）记录。**【待确认】**是否需要做翻译等价性检查，并在分析中控制 `survey_language`。
