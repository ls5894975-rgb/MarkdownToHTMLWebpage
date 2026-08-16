export type WorkKnowledgeItem = {
  tag: string
  title: string
  body: string
}

type KnowledgeTemplate = Omit<WorkKnowledgeItem, 'body'> & {
  body: (title: string) => string
}

const KNOWLEDGE_BY_CATEGORY: Record<string, KnowledgeTemplate[]> = {
  'suzhou-embroidery': [
    { tag: '#劈丝理线', title: '丝线与色阶', body: title => `“${title}”的细腻光泽来自蚕丝线。苏绣常把一根丝线劈成更细的丝缕，再以多层色线渐次衔接，使明暗和转折像绘画一样自然。` },
    { tag: '#施针造型', title: '针法随形', body: title => `绣制“${title}”时，针脚会顺着形体、羽毛或花瓣的生长方向铺陈。齐针、散套针、滚针等技法相互配合，形成平、齐、细、密的苏绣特征。` },
    { tag: '#装裱养护', title: '丝绣保存', body: () => '丝绣怕强光、潮气和摩擦。日常宜避开阳光直射与高湿环境，观赏时少触碰绣面，并定期检查装裱背板是否受潮。' },
  ],
  ruci: [
    { tag: '#雨过天青', title: '天青釉色', body: title => `“${title}”以含蓄的天青色见长。汝瓷釉色受原料配比、窑内还原气氛和温度共同影响，烧成后呈现温润、宁静而不刺目的宋瓷审美。` },
    { tag: '#支钉烧造', title: '满釉支烧', body: () => '传统汝瓷常采用支钉承托烧造，让器物尽量通体施釉，器底仅留下细小支钉痕。支点、器形和升温节奏稍有偏差，就可能造成粘釉或变形。' },
    { tag: '#自然开片', title: '釉面开片', body: title => `“${title}”表面的细密纹路来自胎、釉收缩差异。开片在冷却过程中逐渐形成，纹理疏密与走向各不相同，也是汝瓷含蓄变化的重要观赏细节。` },
  ],
  lacquer: [
    { tag: '#大漆髹饰', title: '层层髹涂', body: title => `“${title}”以天然大漆反复薄髹。每一层都要在适宜温湿度下阴干，再打磨整平，经过多次循环才形成温润、深沉且耐久的漆面。` },
    { tag: '#雕填镶嵌', title: '漆面装饰', body: () => '雕漆、戗金、螺钿、描金等装饰都建立在稳定的漆胎之上。图案既要清楚有层次，也要避免破坏漆层结构，十分考验手上分寸。' },
    { tag: '#避晒防干', title: '漆器养护', body: () => '漆器宜避开暴晒、暖气和骤冷骤热，过度干燥可能使胎体收缩。清洁时用柔软干布轻拭，不使用酒精或强清洁剂。' },
  ],
  woodcarving: [
    { tag: '#相木取势', title: '顺应木性', body: title => `制作“${title}”前要观察木材纹理、硬度和结疤位置，再依材起稿。顺纹下刀能保留强度，也能让天然木纹成为造型的一部分。` },
    { tag: '#层次刀法', title: '深浅相生', body: () => '圆雕、浮雕、透雕与线刻常综合使用。匠人通过刀口角度和进刀深浅组织前后层次，使有限厚度产生丰富空间感。' },
    { tag: '#木作养护', title: '稳定环境', body: () => '木雕最怕温湿度剧烈变化。宜避开暴晒、空调风口和潮湿墙面，少量浮尘可用柔软毛刷顺纹清理，避免水洗。' },
  ],
  papercut: [
    { tag: '#阴阳相生', title: '虚实纹样', body: title => `“${title}”通过保留与镂空形成阴纹、阳纹。线条必须彼此连接，既要保证纸面结构牢固，又要让画面疏密有节奏。` },
    { tag: '#剪刻结合', title: '刀剪技法', body: () => '剪纸既可随手剪成，也可先起稿再以刻刀完成细部。转折处讲究不断线、不毛边，重复纹样尤其考验手眼配合。' },
    { tag: '#吉祥寓意', title: '民俗表达', body: () => '花鸟、瑞兽、文字和器物常以谐音、象征与组合纹样表达祝愿。欣赏剪纸时，可以同时观察造型和图案之间的寓意关系。' },
  ],
  dyeing: [
    { tag: '#扎结防染', title: '留白成纹', body: title => `“${title}”的纹样来自捆扎、缝绞、夹板或蜡防染。被遮挡的部位不易着色，拆开后形成边缘自然、难以完全复制的花纹。` },
    { tag: '#多次浸染', title: '层染显色', body: () => '传统染色通常不是一次完成，而是经历浸染、氧化、晾晒与复染。次数和时间决定颜色深浅，也让色层更稳定、丰富。' },
    { tag: '#植物染养护', title: '温和洗护', body: () => '天然染织物初期可能轻微浮色。宜用冷水和中性洗剂轻柔清洗，避免长时间浸泡与暴晒，并与浅色织物分开处理。' },
  ],
  metalwork: [
    { tag: '#锻打成形', title: '火与锤的塑形', body: title => `“${title}”常由反复加热、锻打和退火逐步成形。锤击既改变器形，也会在金属表面留下富有节奏的手工痕迹。` },
    { tag: '#錾刻纹饰', title: '以錾代笔', body: () => '錾刻利用不同形状的錾子敲击金属表面，表现线条、浮雕与细密地纹。力度过重会伤胎，过轻又难以形成清晰层次。' },
    { tag: '#表面养护', title: '防潮防氧化', body: () => '金属器应保持干燥，减少汗液和酸碱物质接触。清洁时先用软布除尘，不宜自行使用强力抛光剂，以免磨掉原有包浆或装饰层。' },
  ],
  pottery: [
    { tag: '#练泥成坯', title: '泥与器形', body: title => `“${title}”从选泥、练泥到拉坯或手工塑形，每一步都影响器壁厚薄和烧成稳定性。成形后还需缓慢阴干，避免坯体开裂。` },
    { tag: '#施釉入窑', title: '窑火成色', body: () => '釉料厚薄、烧成温度和窑内气氛共同决定最终色泽。火中变化具有偶然性，同一配方也可能产生深浅、流釉和结晶差异。' },
    { tag: '#陶瓷养护', title: '轻拿稳放', body: () => '陶瓷宜双手托底移动，避免只提口沿或耳部。清洁时使用软布和温水，带有开片或金彩的器物不宜久泡。' },
  ],
}

const FALLBACK_CATEGORY = 'pottery'

export function getWorkKnowledge(category: string, title: string): WorkKnowledgeItem[] {
  const templates = KNOWLEDGE_BY_CATEGORY[category] ?? KNOWLEDGE_BY_CATEGORY[FALLBACK_CATEGORY]
  return templates.map(item => ({ tag: item.tag, title: item.title, body: item.body(title) }))
}

export function getWorkQuestions(category: string): string[] {
  const label: Record<string, string> = {
    'suzhou-embroidery': '针法和丝线',
    ruci: '釉色与烧造',
    lacquer: '髹漆与装饰',
    woodcarving: '木材与刀法',
    papercut: '纹样与剪刻',
    dyeing: '防染与显色',
    metalwork: '锻造与錾刻',
    pottery: '成形与窑烧',
  }
  const craft = label[category] ?? '传统工艺'
  return [`这件作品的${craft}难点是什么？`, '它的纹样或造型有什么寓意？', '日常应该怎样保存和养护？']
}
