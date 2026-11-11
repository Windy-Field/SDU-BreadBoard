// 新增芯片资料直接取自用户提供的芯片合集，与独立测试引脚表对应
export const DOCUMENT_REFERENCES = {
    "74LS03": {
        "image": "assets/pinouts/document/74ls03-1.png",
        "logicImage": "assets/pinouts/document/74ls03-2.png",
        "summary": "逻辑功能与74LS00相同，Y=(AB)′，但输出级为集电极开路（OC）结构，使用时输出端必须外接上拉电阻。OC门可以把多个输出直接并联实现“线与”，常用于总线驱动和电平转换"
    },
    "74LS20": {
        "pinWarning": "材料版脚号：第 1 门输入为 1、2、12、13 脚；TI 标准 DIP 第 1 门输入为 1、2、4、5 脚，两者不可混用",
        "image": "assets/pinouts/document/74ls20-1.png",
        "logicImage": "assets/pinouts/document/74ls20-2.png",
        "summary": "片内有2个独立的4输入与非门，Y=(ABCD)′。实验4中用它与74LS138配合实现组合逻辑函数；把多余输入端接高电平或将输入端并接，也可当作反相器使用"
    },
    "CD4011": {
        "image": "assets/pinouts/document/cd4011-1.png",
        "logicImage": "assets/pinouts/document/cd4011-2.png",
        "summary": "CMOS工艺的四2输入与非门，Y=(AB)′。电源电压范围宽（3~15V），输入阻抗极高、静态功耗极小，但多余输入端不允许悬空，必须接VDD或VSS。实验2中用于测量CMOS门的电压传输特性和传输延迟时间"
    },
    "74LS125": {
        "image": "assets/pinouts/document/74ls125-1.png",
        "logicImage": "assets/pinouts/document/74ls125-2.png",
        "summary": "片内有4个独立的三态缓冲门，使能端G′低电平有效：G′=0时Y=A（同相输出），G′=1时输出为高阻态。常用于总线结构、数据选择与信号隔离"
    },
    "74LS138": {
        "image": "assets/pinouts/document/74ls138-1.png",
        "logicImage": "assets/pinouts/document/74ls138-2.png",
        "summary": "3个地址输入端A2A1A0，8个低电平有效的输出端Y0′~Y7′，3个使能端S1（高有效）、S2′、S3′（低有效）。当S1=1且S2′+S3′=0时译码，Yi′=(mi·S)′，被选中端输出低电平；禁止时输出全为高。可作地址译码器、脉冲分配器，配与非门可实现任意三变量组合逻辑函数"
    },
    "74LS139": {
        "image": "assets/pinouts/document/74ls139-1.png",
        "logicImage": "assets/pinouts/document/74ls139-2.png",
        "summary": "片内两个完全独立的2线-4线译码器，各有使能端1G′/2G′（低有效）、地址端1A/1B（2A/2B，A为低位、B为高位）和4个低电平有效输出端。当G′=0时按地址选中一个输出为低电平。用两片半片并接地址、A2作片选（经反相）可扩展成3线-8线译码器"
    },
    "74LS151": {
        "image": "assets/pinouts/document/74ls151-1.png",
        "logicImage": "assets/pinouts/document/74ls151-2.png",
        "summary": "8个数据端D0~D7、3个地址端C（最高位）、B、A（最低位）、低电平有效的使能端G′，以及互补输出Y、W′。G′=0时Y=Di（i=CBA），G′=1时Y=0。可实现任意三变量函数：按F(mi)的取值把Di接1或0即可"
    },
    "74LS153": {
        "image": "assets/pinouts/document/74ls153-1.png",
        "logicImage": "assets/pinouts/document/74ls153-2.png",
        "summary": "片内两个4选1选择器，共用地址端A（低位）、B（高位），各有独立的使能端1G′/2G′和数据输入端1C0~1C3、2C0~2C3。G′=0时Y=Ci（i=BA），G′=1时Y=0。可用两片（或多次复用）实现四变量函数"
    },
    "74LS85": {
        "pinWarning": "材料版脚号：A2 为 14 脚，B2 为 13 脚；TI 标准 DIP 为 A2 13、B2 14，两者不可混用",
        "image": "assets/pinouts/document/74ls85-1.png",
        "logicImage": "assets/pinouts/document/74ls85-2.png",
        "summary": "比较A3A2A1A0与B3B2B1B0，输出A>B、A=B、A<B三个高电平有效信号。2~4脚为级联输入，单片使用时A>B、A<B输入接0、A=B输入接1；两片级联可扩展成8位比较器"
    },
    "74LS48": {
        "image": "assets/pinouts/document/74ls48-1.png",
        "logicImage": "assets/pinouts/document/74ls48-2.png",
        "summary": "把8421BCD码（D为最高位、A为最低位）译成七段字形，输出a~g高电平有效，可直接驱动共阴极数码管，内部有2kΩ上拉电阻。具有LT′灯测试、RBI′灭零输入、BI′/RBO′灭灯输入/动态灭灯输出功能"
    },
    "74LS74": {
        "image": "assets/pinouts/document/74ls74-1.png",
        "logicImage": "assets/pinouts/document/74ls74-2.png",
        "summary": "片内两个独立的上升沿触发D触发器，带异步置位端SD′（低有效）和异步复位端RD′（低有效）。CP上升沿到来时Q*=D。可构成移位寄存器、计数器和分频电路"
    },
    "74LS112": {
        "pinWarning": "材料版脚号：第二路 Q 为 7 脚，Q′ 为 9 脚；TI 标准 DIP 为 Q 9、Q′ 7，第一路脚号相同",
        "image": "assets/pinouts/document/74ls112-1.png",
        "logicImage": "assets/pinouts/document/74ls112-2.png",
        "summary": "片内两个独立的下降沿触发JK触发器，带异步置位端SD′和异步复位端RD′（均低有效）。J=K=1时CP下降沿翻转（T′功能），可构成计数器；与74LS74配合可做触发器相互转换实验"
    },
    "CD4027": {
        "image": "assets/pinouts/document/cd4027-1.png",
        "logicImage": "assets/pinouts/document/cd4027-2.png",
        "summary": "CMOS双JK主从触发器，上升沿触发，置位端SET和复位端RESET为高电平有效（与时钟无关）。电源3~15V，输入阻抗高、功耗低。注意其置位/复位极性和引脚排列与74LS112不同"
    },
    "74LS160": {
        "image": "assets/pinouts/document/74ls160-1.png",
        "logicImage": "assets/pinouts/document/74ls160-2.png",
        "summary": "模10同步加计数器。具有异步清零CLR′（低有效）、同步置数LOAD′（低有效）、计数使能ENP/ENT和进位输出RCO。ENP、ENT均为高电平时在CP上升沿计数；RCO在计数值为9且ENT=1时输出高电平"
    },
    "74LS161": {
        "image": "assets/pinouts/document/74ls161-1.png",
        "logicImage": "assets/pinouts/document/74ls161-2.png",
        "summary": "模16同步加计数器，引脚与74LS160完全相同。异步清零CLR′、同步置数LOAD′、使能ENP/ENT，进位输出RCO。可用于构成任意进制计数器（反馈清零法或置数法）"
    },
    "74LS194": {
        "pinWarning": "材料版脚号：CP 为 2 脚，SR 为 3 脚，SL 为 11 脚，QA～QD 为 12～15 脚；TI 标准 DIP 为 CP 11、SR 2、SL 7、QA～QD 15～12，接实物时不能直接套用本模型脚号",
        "image": "assets/pinouts/document/74ls194-1.png",
        "logicImage": "assets/pinouts/document/74ls194-2.png",
        "summary": "4位双向移位寄存器。S1S0=00保持、01右移、10左移、11并行置数；SR为右移串入端，SL为左移串入端，CLR′为异步清零（低有效）。可构成环形、扭环形计数器及串并转换电路"
    }
};
