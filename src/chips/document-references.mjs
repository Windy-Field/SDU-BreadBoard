// 实验资料中的芯片说明与引脚图路径
export const DOCUMENT_REFERENCES = {
    "6116": {
        image: "assets/pinouts/document/6116-1.png",
        logicImage: "assets/pinouts/document/6116-2.jpeg",
        summary: "6116 是一片 2K×8 静态 RAM，24 脚接 +5V，12 脚接地。A0～A10 用来选地址，D0～D7 既能输入也能输出。CE′、OE′ 和 WE′ 都是低电平有效。写入时把 CE′ 和 WE′ 置 0，读出时设 CE′=0、WE′=1、OE′=0。在确定的禁止条件下，数据端进入高阻态。刚上电时内容未知，断电后会丢失。先结束写入，再关闭 74LS244，可以避免误写。"
    },
    "74LS244": {
        image: "assets/pinouts/document/74ls244-1.png",
        logicImage: "assets/pinouts/document/74ls244-1.png",
        summary: "八路同相三态缓冲器分为两组，每组四路，由 1 脚和 19 脚分别使能。使能为 0 时，数据从 A 端传到 Y 端，电平保持不变。把使能置 1，该组四路输出就进入高阻态。两组可以独立控制，20 脚接 +5V，10 脚接地。"
    },
    "74LS03": {
        "image": "assets/pinouts/document/74ls03-1.png",
        "logicImage": "assets/pinouts/document/74ls03-2.png",
        "summary": "它和 74LS00 一样实现与非逻辑，Y=(AB)′。输出是集电极开路（OC），需要外接上拉电阻。多个 OC 输出可以并联实现「线与」，常用于总线驱动和电平转换。"
    },
    "74LS20": {
        "pinWarning": "材料版脚号：第 1 门输入为 1、2、12、13 脚；TI 标准 DIP 第 1 门输入为 1、2、4、5 脚，两者不可混用",
        "image": "assets/pinouts/document/74ls20-1.png",
        "logicImage": "assets/pinouts/document/74ls20-2.png",
        "summary": "片内有两个独立的四输入与非门，Y=(ABCD)′。和 74LS138 配合使用，就能实现组合逻辑函数。要把它当作反相器，可以把多余的输入接到高电平，也可以把输入并在一起。"
    },
    "CD4011": {
        "image": "assets/pinouts/document/cd4011-1.png",
        "logicImage": "assets/pinouts/document/cd4011-2.png",
        "summary": "片内有四个双输入 CMOS 与非门，Y=(AB)′。它的电源电压范围是 3～15 V，输入阻抗高，静态功耗小。多余的输入脚要接 VDD 或 VSS。实验 2 可用它测量电压传输特性和传输延迟。"
    },
    "74LS125": {
        "image": "assets/pinouts/document/74ls125-1.png",
        "logicImage": "assets/pinouts/document/74ls125-2.png",
        "summary": "片内有四个独立的同相三态缓冲门。G′ 为 0 时，Y 跟随 A，电平保持不变。G′ 为 1 时，Y 进入高阻态。它常用于总线、数据选择和信号隔离。"
    },
    "74LS139": {
        "image": "assets/pinouts/document/74ls139-1.png",
        "logicImage": "assets/pinouts/document/74ls139-2.png",
        "summary": "片内有两个独立的二线四线译码器。每组都有自己的低有效使能脚、两个地址脚和四个低有效输出脚。A 是地址低位，B 是高位。G′ 为 0 时，地址选中的一路输出低电平。把两组的地址脚并接，再用 A2 及其反相信号选通其中一组，就能组成三线八线译码器。"
    },
    "74LS151": {
        "image": "assets/pinouts/document/74ls151-1.png",
        "logicImage": "assets/pinouts/document/74ls151-2.png",
        "summary": "D0～D7 是八路数据输入，地址 C、B、A 从高位到低位排列，Y 和 W′ 是互补输出。G′ 为 0 时，Y 输出地址选中的数据 Di（i=CBA）。G′ 为 1 时，Y 输出 0。把各个 Di 按 F(mi) 的取值接到 0 或 1，就能实现任意三变量函数。"
    },
    "74LS153": {
        "image": "assets/pinouts/document/74ls153-1.png",
        "logicImage": "assets/pinouts/document/74ls153-2.png",
        "summary": "两组四选一选择器共用地址端 A（低位）和 B（高位），各有自己的使能脚 1G′、2G′ 和数据输入。某组的 G′ 为 0 时，Y 输出地址选中的 Ci（i=BA），G′ 为 1 时，Y 输出 0。用两片芯片或多次复用，可以实现四变量函数。"
    },
    "74LS85": {
        "pinWarning": "材料版脚号：A2 为 14 脚，B2 为 13 脚；TI 标准 DIP 为 A2 13、B2 14，两者不可混用",
        "image": "assets/pinouts/document/74ls85-1.png",
        "logicImage": "assets/pinouts/document/74ls85-2.png",
        "summary": "用来比较 A3A2A1A0 和 B3B2B1B0，三个高有效输出分别表示 A>B、A=B 和 A<B。2～4 脚是级联输入。单片使用时，把 A>B、A<B 输入置 0，把 A=B 输入置 1。两片级联后可以比较八位数。"
    },
    "74LS48": {
        "image": "assets/pinouts/document/74ls48-1.png",
        "logicImage": "assets/pinouts/document/74ls48-2.png",
        "summary": "把 8421 BCD 码（D 是最高位，A 是最低位）转换为七段字形。a～g 输出高电平有效，内部有 2 kΩ 上拉电阻，可以直接驱动共阴极数码管。LT′ 用于灯测试，RBI′ 用于灭零，BI′/RBO′ 可用作灭灯输入或动态灭灯输出。"
    },
    "74LS74": {
        "image": "assets/pinouts/document/74ls74-1.png",
        "logicImage": "assets/pinouts/document/74ls74-2.png",
        "summary": "片内有两个独立的上升沿 D 触发器。SD′ 和 RD′ 分别用于异步置位和复位，都是低电平有效。CP 到了上升沿，Q 就会保存 D 的电平。它可以用来搭建移位寄存器、计数器和分频电路。"
    },
    "74LS112": {
        "pinWarning": "材料版脚号：第二路 Q 为 7 脚，Q′ 为 9 脚；TI 标准 DIP 为 Q 9、Q′ 7，第一路脚号相同",
        "image": "assets/pinouts/document/74ls112-1.png",
        "logicImage": "assets/pinouts/document/74ls112-2.png",
        "summary": "片内有两个独立的下降沿 JK 触发器，SD′ 和 RD′ 分别用于异步置位和复位，都是低电平有效。J、K 都为 1 时，CP 每出现一次下降沿，Q 就翻转一次（T′ 功能）。它可用于计数，也可与 74LS74 配合做触发器相互转换实验。"
    },
    "CD4027": {
        "image": "assets/pinouts/document/cd4027-1.png",
        "logicImage": "assets/pinouts/document/cd4027-2.png",
        "summary": "这是 CMOS 双 JK 主从触发器，在上升沿触发。SET 和 RESET 都是高电平有效，不需要等待时钟。它的电源范围为 3～15 V，输入阻抗高，功耗低。置位、复位极性和脚位与 74LS112 不同。"
    },
    "74LS160": {
        "image": "assets/pinouts/document/74ls160-1.png",
        "logicImage": "assets/pinouts/document/74ls160-2.png",
        "summary": "这片计数器按模 10 同步加计数。CLR′ 和 LOAD′ 都是低电平有效，分别用于异步清零和同步置数。ENP 和 ENT 都为高电平时，每个 CP 上升沿计数一次。计到 9 且 ENT 为 1 时，RCO 输出高电平。"
    },
    "74LS161": {
        "image": "assets/pinouts/document/74ls161-1.png",
        "logicImage": "assets/pinouts/document/74ls161-2.png",
        "summary": "这片计数器按模 16 同步加计数，脚位与 74LS160 相同。CLR′ 和 LOAD′ 都是低电平有效，分别用于异步清零和同步置数。ENP、ENT 用于使能计数，RCO 用于输出进位。用反馈清零或置数，可以得到其他计数模数。"
    }
};
