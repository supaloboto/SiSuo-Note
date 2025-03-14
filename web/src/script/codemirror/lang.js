import { ContextTracker, ExternalTokenizer, LRParser, LocalTokenGroup } from '@lezer/lr';
import { LRLanguage, indentNodeProp, delimitedIndent, foldNodeProp, foldInside, LanguageSupport } from '@codemirror/language';
import { styleTags, tags } from '@lezer/highlight';

// This file was generated by lezer-generator. You probably shouldn't edit it.
const noSemi = 95,
  insertSemi = 96,
  spaces = 98,
  newline = 99,
  LineComment = 1,
  BlockComment = 2;

//!trackNewline

const trackNewline = new ContextTracker({
  start: false,
  shift(context, term) {
    return term == LineComment || term == BlockComment || term == spaces
      ? context : term == newline
  },
  strict: false
});

const space = [9, 10, 11, 12, 13, 32, 133, 160];
const braceR = 125, semicolon = 59, slash = 47, star = 42;

const insertSemicolon = new ExternalTokenizer((input, stack) => {
  let { next } = input;
  if (next == braceR || next == -1 || stack.context)
    input.acceptToken(insertSemi);
}, { contextual: true, fallback: true });

const noSemicolon = new ExternalTokenizer((input, stack) => {
  let { next } = input, after;
  if (space.indexOf(next) > -1) return
  if (next == slash && ((after = input.peek(1)) == slash || after == star)) return
  if (next != braceR && next != semicolon && next != -1 && !stack.context)
    input.acceptToken(noSemi);
}, { contextual: true });

// This file was generated by lezer-generator. You probably shouldn't edit it.
const spec_Identifier = { __proto__: null, function: 12, true: 42, false: 42, this: 44, null: 46, super: 48, new: 74, void: 80, typeof: 82, delete: 84, var: 132, ref: 134, for: 140, in: 146, if: 150, elseif: 152, else: 154, return: 158 };
const spec_PropertyName = { __proto__: null, get: 65, set: 67 };
const parser = LRParser.deserialize({
  version: 14,
  states: "MfQ`QQOOO#PQQOOP$^OQOOO$cO!bO'#CmO&OQQO'#CvO&`QQO'#DOO#PQQO'#DTO&gQQO'#DZO'rQtO'#D^O'yQQO'#D]O(OQtO'#EPO)tQtO'#ElO){QQO'#DjOOQp'#El'#ElOOQp'#Ej'#EjOOQO'#EQ'#EQOOQO'#Eh'#EhOOQO'#ET'#ETQ`QQOOO#PQQO'#DQO*QQQO'#C`O*VQQO'#DoO*bQQO'#DsO*gQQO'#DxO*lQsO'#D|O+YQWO'#CyO+jQtO'#D^Q+tQSOOO,cQQO'#D[P,kO#tO'#C^POOO)C@V)C@VO#PQQO'#CoOOOO'#EU'#EUO,vO!bO,59XOOQp,59X,59XO-UQQO'#EVO-iQQO'#EqO.cQSO'#EqO$qQQO'#EqO.jQQO,59bO.oQQO'#EkO.rQQO'#EkO.zQQO,59TOOQp,59j,59jO/PQQO,59jO/WQtO,59oO/kQSO,59uO/rQQO'#EiO*VQQO'#EiO/}QQO,59PO#PQQO,5:UO`QQO,5:jO1^QQO,59wO2rQQO'#DSO2|QSO,59zO3RQQO,59zO#PQQO,59|O#PQQO,59|O#PQQO,59|O4`QQO,5:ROOQp,5:W,5:WOOQO'#Ew'#EwOOQO,5:k,5:kO#PQQO,5:UOOQO-E8R-E8RO5mQtO,59lO,fQQO,58zO6QQQO'#CiO6wQWO'#DmO7OQrO'#EvO(kQrO,5:ZO7^QQO'#DuO`QQO,5:_O#PQQO'#DZO`QQO,5:dOOQO,5:h,5:hO#PQQO,5:hO7nQQO'#EsO3RQQO'#EsOOQO'#Es'#EsO8VQQO'#CzO$qQQO'#CzO8eQQO'#ErO8mQQO,59eO8rQQO'#EuO8zQQO,5:XO9PQSO'#CzO9_QQO'#CeO9pQQO,59vO,fQQO,59vPOOO'#ES'#ESP9uO#tO,58xPOOO,58x,58xO:QQSO,59ZOOOO-E8S-E8SOOQp1G.s1G.sO:vQSO,5:qO$qQQO,5:qO;QQQO,5:tO;]QQO'#EVOOQO-E8T-E8TO;jQQO,5;]O;rQSO,5;]O;yQQO,5;VOOQp1G.|1G.|O1eQQO7+%zO<UQQO'#EYO;|QQO,5;VOOQO-E8W-E8WOOQp1G.o1G.oOOQp1G/U1G/UOOQp1G/a1G/aO1eQQO,5:UO<jQQO'#E[O<xQQO,5;TO=QQQO,5;TOOQO1G.k1G.kO=]QtO1G/pOOQO1G0U1G0UOOQp1G/c1G/cO=pQtO1G/cO>TQSO'#EtO1eQQO'#EtO>_QQO,59nOOQp1G/f1G/fO?RQSO1G/fO@QQtO1G/hOA]QtO1G/hOAdQtO1G/hOB`Q`O'#D^OCXQ`O1G/mOC`Q`O'#ElOCgQtO1G/pOOQp1G/W1G/WO9pQQO1G.fOCzQQO'#EkO*VQQO'#EkO*VQQO'#DnODVQQO'#DnO*VQQO'#E]OD[QrO,5;bO1eQQO,5;bOOQO1G/u1G/uOE_Q`O,5:bOEiQSO,5:aOEpQQO,5:aO*VQQO,5:bOOQO1G/y1G/yOEwQQO1G0OO(OQtO1G0SO1eQQO,5:YOGtQSO,5;_O9pQQO,59fO$qQQO,59fOG{QSO,59fOHVQQO,5:YOHbQWO'#EWOHlQQO,5;^OOQp1G/P1G/PO6fQWO'#EZOHtQQO,5;aOOQp1G/s1G/sO,fQQO,59fOH|QQO'#EiOOQp1G/b1G/bO9pQQO1G/bPOOO-E8Q-E8QPOOO1G.d1G.dOOOO1G.u1G.uOIXQSO1G0]OIcQQO1G0`O1eQQO,5:qOInQQO1G0wOIvQQO1G0qOJOQSO<<IfOJYQQO,5:tO*VQQO,5:tOJeQSO1G/pOJoQQO,5:vO*VQQO,5:vOOQO-E8Y-E8YOJzQQO1G0oO1eQQO1G0oOKSQQO'#EXOKZQQO,5;`OKcQSO,5;`OOQp1G/Y1G/YOOQp7+%Q7+%QOKmQ`O,59oO#PQQO7+%XOKtQ`O,59lOOQO7+$Q7+$QO1eQQO,5;VOK{QQO,5;VOLWQQO,5:YO*VQQO,5:YOLcQrO,5:wOOQp-E8Z-E8ZOLqQtO1G0|O#PQQO1G/|OMOQQO1G/{OMVQSO1G/{OM^QQO1G/{OMeQrO1G/|O*gQQO7+%jOOQO7+%n7+%nOMvQSO1G/tOOQO1G0y1G0yOOQO1G/Q1G/QONQQSO1G/QON[QQO1G/tO1eQQO7+%`ONgQQO'#CzO1eQQO'#CzOOQO,5:r,5:rOOQO-E8U-E8UOOQO,5:u,5:uOOQO-E8X-E8XO9pQQO1G/QO1eQQO,5;TOOQp7+$|7+$|ONuQQO7+&]O1eQQO1G0`ON}QQO1G0`O! YQQO7+&ZO1eQQO1G0bO! bQQO1G0bO! mQSO7+&ZO! wQSO,5:sO1eQQO,5:sOOQO-E8V-E8VO!!RQQO1G0zO!!ZQ`O1G/pO!!bQ`O1G/cO!#QQ`O1G/hO!#_Q`O1G/hO!$TQ`O1G/hO!$bQtO<<HsO!$uQSO1G0qO1eQQO1G0qO1eQQO1G/tO!%PQQO1G/tO1eQQO1G0cO!%[QrO7+&hO!%gQSO7+%hO!%nQSO7+%gO!%uQQO7+%gO!%|QSO7+%gOOQO7+%g7+%gO#PQQO7+%hO`QQO<<IUO!&TQSO<<HzO1eQQO,59fOOQO7+$l7+$lO!&_QSO1G0oO!&iQQO<<IwO!&qQSO7+%zO1eQQO7+%zO!&{QSO7+%|O1eQQO7+%|O!'VQQO<<IuO!'_QSO1G0_O!'iQSO7+&]O!'sQSO7+%`O1eQQO7+%`O!'}QtO7+%}OOQO<<IS<<ISO!([QQO<<IRO!(cQSO<<IROOQO<<IR<<IRO!(jQSO<<ISO!(qQQOAN>pO!(vQSO<<IfO!)QQSO<<IhO!)[Q`O<<HsO!)cQSO<<HzO!)mQSOAN>mOOQOAN>mAN>mOOQOAN>nAN>nO`QQOG24[OOQOG24XG24XOOQOLD)vLD)vO4`QQO'#DTO4`QQO'#DQO!)tQSO'#D^O!+VQtO'#D^O!,[QSO'#D^O1eQQO,5:UO4`QQO,5:UO3RQQO,5:UO!-yQQO,59wO!/[QQO,59wO!0mQQO,59wO1eQQO,59|O4`QQO,59|O3RQQO,59|O1eQQO,59|O4`QQO,59|O3RQQO,59|O1eQQO,59|O4`QQO,59|O3RQQO,59|O1eQQO,5:UO!0tQtO,59lO!1[QSO,59lO!1cQtO,59oO!1yQSO,59oO!2QQQO'#EsO!2`QtO1G/pO!2vQSO1G/pO!2}QtO1G/cO!3eQSO1G/cO!3lQtO1G/hO!4hQSO1G/hO!5WQtO1G/hO!5tQSO1G/hO!5{QtO1G/pO1eQQO7+%XO4`QQO7+%XO3RQQO7+%XO!6cQtO<<HsO!6yQSO<<HsO1eQQO'#DTO3RQQO'#DTO!7QQQO'#D]O!7VQQO'#D]O!7[QQO'#D]O!7aQtO'#ElO!8]QSO'#ElO!8dQQO'#DjO!8iQQO'#DjO!8nQQO'#DjO1eQQO'#DQO3RQQO'#DQO!8sQ`O1G/mO!8zQ`O1G/mO!9RQ`O1G/mO!9YQSO'#D^O4`QQO,5:RO4`QQO,5:RO4`QQO,5:R",
  stateData: "!9k~O#UOS#VOSPOS#WQQ~OTWOUdOWVO[SO_]O`]Oe]Of]Og]Oh]Oi]OlTOucOxUOyUOzUO{UO|UO!deO!eeO!f_O!hfO!mgO!qhO#aRO~OTjOUlOWVO[SO_]O`]Oe]Of]Og]Oh]Oi]OliOucOxUOyUOzUO{UO|UO#aRO~O#WmO~OdoO#bpO#cpO#drO~OT'YOUlOWVO[SO_]O`]Oe]Of]Og]Oh]Oi]OliOu(YOx(OOy(OOz(OO{(OO|(OO#aRO~OYvOksOZ#_PZ#eP~P$qOb{O~P`OT'WOY!QOV#]P~P#SO!_!SOW#`X[#`X^#^X|#`X!R!QX!T#`X!V#`X!W#`X!X#`X!Y#`X![#`X!f#`X#S#`X~Os!TO~P&tO!R!UO~OW!VO[!XO|!ZO!T!WO!V!YO!W!YO!X!YO!Y![O![!]O!f!_O#S!_O~O!_!SOW#`X[#`X|#`X!T#`X!V#`X!W#`X!X#`X!Y#`X![#`X!f#`X#S#`X#Q#`XV#`Xb#`X~O^!SO~P(sO^!aO~OT!dO~OT^O[!eOl!fO~OW!iO~OW!kO~O!f!_O#R!nO#S!_O~O[!pO_!qO`!qOp!xOq!xO~OY!sOo!oOb#fPb#iP~P*wO^#^X!R!QX~P(sOW!VO[!XO|!ZO!T!WO!V!YO!W!YO!X!YO!Y![O![!]O~OT!{OW!yO~O#X!|O#Y!|O#Z#OO~OdoO#bpO#cpO#d#RO~OY#TOZ!yXZ!|Xk!yXk!|X~P$qOk#VOZ#eX~OW!VO[!XOk#VO|'dO!T!WO!V'aO!W'aO!X'aO!Y'gO![(`O~OZ#eX~P-qOZ#[O~O^#]Ok#^OZ#_X~OZ#aO~Ob#bO~P`O!fwa#Swa#QwaVwabwa~P+tOV#cO~P+tO^#dOk#eOV#]X~OV#hO~OTjOUlOWVO[SO_]O`]Oe]Of]Og]Oh]Oi]OucOxUOyUOzUO{UO|UO#aRO~OlTO~P0SOT'XOUlOWVO[SO_]O`]Oe]Of]Og]Oh]Oi]OliOu(YOx(OOy(OOz(OO{(OO|(OO#aRO~OY#nOV#hP~P1eOo#pO~OT(_OUlOWVO[SO_]O`]Oe]Of]Og]Oh]Oi]OliOu(ZOx(POy(POz(PO{(PO|(PO#aRO~OT#uOUlOWVO[SO_]O`]Oe]Of]Og]Oh]Oi]OliOu'VOx'UOy'UOz'UO{'UO|'UO#aRO~O!fta#Sta#QtaVtabta~P+tOT^OY#|O[!eOk#^Ol!fOZ#_P~OY#}O[!pO_!qO`!qOo'oO~Ob#iP~P6fO^$ROk$PO!f#jX#S#jX~OT$TO!d$WO!eeO!f$VO~P#SO^$[OW#gXb!bXb#gXk!bXk#gXs#gX~OW!yOs$_ObnXknX~Ok$bOb#fX~Ob$dO~Ok$eOb#iX~Ob$gO~O[!pO_!qO`!qOo!qO~OT^OY!QO[!eOl!fOV#]P~OlTO~O#X!|O#Y!|O#Z$mO~Ob$nO~P+tOW!VO[!XO|'dO!T!WO!V'aO!W'aO!X'aO!Y'gO![(`O~OZ!yak!ya~P:XO^#]OZ!|ak!|a~OY$qOZ!yXk!yX~P1eOk#VOZ#ea~OZ#ea~P-qO^#]Ok#^OZ#_a~OT^OY$vO[!eOl!fOZ!|Xk!|X~OT^OY$yO[!eOl!fO~Ok#eOV#]a~O^$|Ok#eOV#]a~O!f!^i#S!^i#Q!^iV!^ib!^i~P+tO!f!Pi#S!Pi#Q!PiV!Pib!Pi~P+tOk$}OV#hX~P:XOV%QO~OW!VO[!XO|'fO!T!WO!V'cO!W'cO!X'cO!Y'iO![(bO~OZ%RO~P>dOW!VO[!XO!T!WO|!Ui!Y!Ui![!Ui!f!Ui#S!UiZ!Uik!UiV!Uib!Ui~O!V!Ui!W!Ui!X!Ui#Q!Ui~P?YOW!VO[!XO!T!WO!V!YO!W!YO!X!YO!Y!Ui![!Ui!f!Ui#S!Ui#Q!UiV!Uib!Ui~O|!Ui~P@bO|!ZO~P@bO!_'[OW#`X[#`X|#`X!T#`X!V#`X!W#`X!X#`X!Y#`X![#`X!]#`X~O^#^X!R!QX~PAkOW!VO[!XO|'eO!T!WO!V'bO!W'bO!X'bO!Y'hO![(aO~O!]%TO~PBjO^'[O~PAkO!f!^i#S!^i#Q!^ib!^iV!^i~P+tO^%WOk#^OZ#_X~Os%ZO~Ok$PO!f#ja#S#ja~O!_!SOW#`X[#`X^#^X|#`X!R!QX!T#`X!V#`X!W#`X!X#`X!Y#`X![#`X~O!k%_O!f#`X~PDgO!f%`O~P+tO!f%bO~P#PO!n%dOT!liU!liW!li[!li_!li`!lie!lif!lig!lih!lii!lil!liu!lix!liy!liz!li{!li|!li!d!li!e!li!f!li!h!li!m!li!q!li#Q!li#a!lib!li!o!li~OZ%gO~P>dObnakna~P:XO^%kOb!bak!ba~OY%mOo!qO~P*wOk$bOb#fa~Ok$eOb#ia~O^%sOk#eOV#]X~OZ!yik!yi~P:XO^#]OZ!|ik!|i~Ok#VOZ#ei~Ok#^OZ#_i~OZ!^ik!^i~P:XO^%vOZ!|ak!|a~Ok#eOV!^i~P:XO^%yOV#Oak#Oa~Ok#eOV#]i~OY%}O~P1eOk$}OV#ha~Ok$}OV#ha~P:XO!]wa~PBjO!]ta~PBjO^&XOk#^OZ#_a~O^&YOb!bak!ba~O^&[Ok#Pa!f#Pa#S#Pa~Ok$PO!f#ji#S#ji~P:XO!f&`O~P#PO!f&`O~P+tOV&bO~P#PO^$ROk$PO!k&cO!f#jX#S#jX~Ob!bik!bi~P:XObnikni~P:XO^%kOb!bik!bi~OW!yOs&fObnXknX~Ok#^OZ#_q~O^&kOZ!|ik!|i~Ok#eOV#]q~O^&mOV#Oik#Oi~Ok#eOV#]q~P:XOV!{ak!{a~P:XOk$}OV#hi~O!]!^i~PBjO!]!Pi~PBjOW!VO[!XO!T!WO|!Ui!Y!Ui![!Ui!]!Ui~O!V!Ui!W!Ui!X!Ui~P!!iO!V'bO!W'bO!X'bO~P!!iOW!VO[!XO|'eO!T!WO!V'bO!W'bO!X'bO~O!Y!Ui![!Ui!]!Ui~P!#lO!f!Zy#S!Zy#Q!ZyV!Zyb!Zy~P+tOk#^OZ#_i~P:XO^&rOb!bik!bi~Ok$PO!f#jq#S#jq~OV&tO~P+tO!f&uO~P+tOV&wO~P#POV&wO~P+tOb!^ik!^i~P:XOk#eOV#]i~P:XOk#^OZ#_y~OZ!|qk!|q~P:XOV#Oqk#Oq~P:XOk#eOV#]y~OV!{ik!{i~P:XOk#^OZ#_q~P:XOb!bqk!bq~P:XOk#Pq!f#Pq#S#Pq~P:XOV'PO~P#POV'PO~P+tOV'QO~P+tO!o'RO~OZ!|yk!|y~P:XOV#Oyk#Oy~P:XO!]!Zy~PBjOb!byk!by~P:XOV'SO~P+tOV#^XV#`Xk#^X~PDgO!_'ZOW#`XZ#`X[#`Xk#`X|#`X!T#`X!V#`X!W#`X!X#`X!Y#`X![#`XV#`X!f#`X#S#`Xb#`X~O^#^X!R!QX~P!*RO!_'ZOW#`XZ#`X[#`Xk#`X|#`X!T#`X!V#`X!W#`X!X#`X!Y#`X![#`Xb#`X~OZ#^X^#^Xk#^X!R!QXb#^X~P!+aOT'XOUlOWVO[SO_]O`]Oe]Of]Og]Oh]Oi]Ou(YOx(OOy(OOz(OO{(OO|(OO#aRO~OlTO~P!,oOT#uOUlOWVO[SO_]O`]Oe]Of]Og]Oh]Oi]Ou'VOx'UOy'UOz'UO{'UO|'UO#aRO~OlTO~P!.QOT(_OUlOWVO[SO_]O`]Oe]Of]Og]Oh]Oi]Ou(ZOx(POy(POz(PO{(PO|(PO#aRO~OlTO~P!/cOZtaktaVtabta!fta#Sta~P:XOZta~P>dOZwakwaVwabwa!fwa#Swa~P:XOZwa~P>dO^$[Ob!bXk!bXs#gX~OZ!^ik!^iV!^ib!^i!f!^i#S!^i~P:XOZ!^i~P>dOZ!Pik!PiV!Pib!Pi!f!Pi#S!Pi~P:XOZ!Pi~P>dO!V'aO!W'aO!X'aO~P?YOW!VO[!XO!T!WO!V'cO!W'cO!X'cOZ!Ui!Y!Ui![!Ui~O|!Ui~P!3yOW!VO[!XO|'dO!T!WO!V'aO!W'aO!X'aO~OZ!Uik!Ui!Y!Ui![!UiV!Uib!Ui!f!Ui#S!Ui~P!4oO|'fO~P!3yOZ!^ik!^iV!^i!f!^i#S!^ib!^i~P:XOZ!Zyk!ZyV!Zyb!Zy!f!Zy#S!Zy~P:XOZ!Zy~P>dO!R'^O~O!R'_O~O!R'`O~O^'ZO~P!*RO!_']OW#`XZ#`X[#`X|#`X!T#`X!V#`X!W#`X!X#`X!Y#`X![#`X~O^']O~P!7hO^'jO~O^'[O~O^']O~O!]'yO~PBjO!]'zO~PBjO!]'{O~PBjO^#^X!R!QX~P!7hO#WP_!T!Vi~",
  goto: "AZ#lPP#mP#pPPPP#{PPP&ePPP(tP*vPPPPPP(tPP(t*zPPP+QP(tP+r(tPPPPP-g(t(t/oP1wP(tPPPP(tPP(tP(t&e4P4WPPP#pP4f4fP#pPPP#pP#p#p#pP4i4o4y5P5_5e5o6Y6`6tPPPPPPPPPP7P7f7j:y:}PPPP@_@b@e@r@u@y@}RnQc`OTb|!T!j!l&d'R!`XOPTUVbco|!S!T!U!Y!Z![!a!i!j!k!l!n$V%T%_%`%b&`&c&d&u'RQ!zlQ#z!dS$^!r%lQ$k!{Q%r$h!p(QSsv!V!s#T#V#]#d#n$R$[$_$q$|$}%W%k%m%s%v%y%}&X&Y&[&f&k&m&r'Z'^'a'd'g'j'y(O(Yh(R!]'U'V'['_'b'e'h'z(`(a(be(S!X!p']'`'c'f'i'{(P(Z%k^OPSTUVbceosv|!Q!S!T!U!V!X!Y!Z![!]!a!e!i!j!k!l!n!p!s!y#T#V#]#^#d#e#n#|#}$P$R$V$W$[$_$q$v$y$|$}%T%W%Z%_%`%b%k%m%s%v%y%}&X&Y&[&`&c&d&f&k&m&r&u'R'U'V'Z'[']'^'_'`'a'b'c'd'e'f'g'h'i'j'y'z'{(O(P(Y(Z(`(a(b%P]OPSTUVbcosv|!S!T!U!V!X!Y!Z![!]!a!i!j!k!l!n!p!s#T#V#]#d#n$R$V$[$_$q$|$}%T%W%_%`%b%k%m%s%v%y%}&X&Y&[&`&c&d&f&k&m&r&u'R'U'V'Z'[']'^'_'`'a'b'c'd'e'f'g'h'i'j'y'z'{(O(P(Y(Z(`(a(bTpRqQ!tiR%n$bb`OTb|!T!j!l&d'RW#k!U'^'_'`Q$j!zQ%V#zQ%h$^Q%t$kR&g%r$W!^Yku}!O#P#S#Y#i#l#m#q#r#s#t#v#x$U$Z$]$`$o$t$w%P%S%^%a%f%i%{%|&Q&R&S&T&U&V&W&^&_&a&e&h&j&l&o&p&q&s&v&x&z&{&|&}'O'm'n'p'q'r's't'u'v'w'x'|'}([(](^X#y!c%U'k'l%O]OPSTUVbcosv|!S!T!U!V!X!Y!Z![!]!a!i!j!k!l!n!p!s#T#V#]#d#n$R$V$[$_$q$|$}%T%W%_%`%b%k%m%s%v%y%}&X&Y&[&`&c&d&f&k&m&r&u'R'U'V'Z'[']'^'_'`'a'b'c'd'e'f'g'h'i'j'y'z'{(O(P(Y(Z(`(a(bQ!lgR&d%d!`XOPTUVbco|!S!T!U!Y!Z![!a!i!j!k!l!n$V%T%_%`%b&`&c&d&u'R!p(QSsv!V!s#T#V#]#d#n$R$[$_$q$|$}%W%k%m%s%v%y%}&X&Y&[&f&k&m&r'Z'^'a'd'g'j'y(O(Yh(R!]'U'V'['_'b'e'h'z(`(a(be(S!X!p']'`'c'f'i'{(P(Z!`ZOPTUVbco|!S!T!U!Y!Z![!a!i!j!k!l!n$V%T%_%`%b&`&c&d&u'Rh#w!]'U'V'['_'b'e'h'z(`(a(b!p(TSsv!V!s#T#V#]#d#n$R$[$_$q$|$}%W%k%m%s%v%y%}&X&Y&[&f&k&m&r'Z'^'a'd'g'j'y(O(Ye(U!X!p']'`'c'f'i'{(P(ZS!vi!fR%p$eb`OTb|!T!j!l&d'RR$V!iR!jfQ!}mR$l!}QbOQ|TT!bb|QqRR#QqQtSU#Wt#X$rQ#XuR$r#YQ$c!tR%o$cQ%O#mS&O%O&PR&P%PSyS!eS#_x#{Y#`y#_$s%u&iS$s#Z%XQ%u&WR&i&pQ$f!vR%q$fS#f!P$iW$z#f${%x&nQ${#gS%x$w&hR&n%{S$Q!g%cS%]$Q&]R&]%^WaOTb|Q#j!TQ$X!jQ$Y!lQ&y&dR'T'RT!RV!y!^[OPTUbco|!S!T!U!Y!Z![!a!i!j!k!l!n$V%T%_%`%b&`&c&d&u'RQxSQ!PVQ!geQ#UsQ#ZvQ#g!QQ#{!eQ$a!sQ$i!yQ$p#TQ$u#^Q$x#eQ%X#|Q%Y#}Q%[$PQ%c$WQ%j$_Q%w$vQ%z$yQ&Z%Z!d(V!V#V#]#d#n$R$[$q$|$}%W%k%m%s%v%y%}&X&Y&[&f&k&m&r'Z'^'a'd'g'j'y(O(Yh(W!]'U'V'['_'b'e'h'z(`(a(be(X!X!p']'`'c'f'i'{(P(ZTzS!ebYOTb|!T!j!l&d'RQkPQuSQ}US!OV!kQ!ccQ#PoS#Ss#VQ#YvQ#i!SQ#l!UQ#m!VQ#q!XU#r!Y'a'cQ#s!ZQ#t![Q#v!]Q#x!aQ$U!iQ$Z!nQ$]!pS$`!s%mS$o#T$qQ$t#]Q$w#dQ%P#nQ%S'UQ%U'VQ%^$RQ%a$VQ%f$[S%i$_&fQ%{$|Q%|$}Q&Q'[Q&R'_Q&S'bQ&T'eQ&U'hQ&V%TQ&W%WQ&^%_Q&_%`Q&a%bQ&e%kQ&h%sQ&j%vQ&l%yQ&o%}Q&p&XQ&q&YQ&s&[Q&v&`Q&x&cQ&z&kQ&{&mQ&|'zQ&}&rQ'O&uQ'k(YQ'l(ZQ'm(OQ'n(PQ'p'ZQ'q']Q'r'^Q's'`Q't'dQ'u'fQ'v'gQ'w'iQ'x'jQ'|'yQ'}'{Q([(`Q(](aR(^(bRwSR!uiQ!riS$O!f$eQ$h!xR%l$bR#o!VT!wi!fT!he$WQ!`YQ!mhQ$S!hR%e$Z",
  nodeNames: "⚠ LineComment BlockComment Script FunctionDeclaration Identifier function ) ( ParamList ... ] [ ArrayPattern = Number String TemplateString } Interpolation ${ BooleanLiteral this null super RegExp ArrayExpression , { ObjectExpression Property PropertyName get set Block : NewExpression new ArgList UnaryExpression void typeof delete LogicOp ArithOp ParenthesizedExpression FunctionExpression ArrowFunction ParamList => MemberExpression . BinaryExpression ArithOp ArithOp ArithOp CompareOp ConditionalExpression LogicOp LogicOp AssignmentExpression UpdateOp CallExpression ObjectPattern PatternProperty VariableDeclaration var ref ; ForStatement for ForSpec ForInSpec in IfStatement if elseif else ReturnStatement return LabeledStatement ExpressionStatement EmptyStatement SingleExpression",
  maxTerm: 119,
  context: trackNewline,
  nodeProps: [
    ["group", -9, 4, 34, 65, 69, 74, 78, 80, 81, 82, "Statement", -21, 5, 15, 16, 17, 21, 22, 23, 24, 25, 26, 29, 36, 39, 45, 46, 47, 50, 52, 57, 60, 62, "Expression"],
    ["openedBy", 7, "(", 11, "[", 18, "{"],
    ["closedBy", 8, ")", 12, "]", 28, "}"]
  ],
  skippedNodes: [0, 1, 2, 84],
  repeatNodeCount: 10,
  tokenData: "5c~RvXY#iYZ#zZ[#i]^#zpq#iqr$Prs$ftu&^uv'Twx'bxy)Tyz)Yz{)_{|)g|})o}!O)g!O!P)t!P!Q+b!Q!R0|!R![1n![!]4V!]!^4^!^!_$X!_!`4c!`!a$X!a!b4s!c!}&^!}#O4x#P#Q4}#R#S&^#S#T5S#T#o&^#o#p5X#q#r5^$f$g#i$g;'S&^;'S;=`&}<%lO&^~#nS#U~XY#iZ[#ipq#i$f$g#i~$PO#V~|$UP{S!_!`$Xx$^P!Yx!_!`$ax$fO!Yx~$kW`~OY$fZr$frs%Ts#O$f#O#P%Y#P;'S$f;'S;=`&W<%lO$f~%YO`~~%]RO;'S$f;'S;=`%f;=`O$f~%kX`~OY$fZr$frs%Ts#O$f#O#P%Y#P;'S$f;'S;=`&W;=`<%l$f<%lO$f~&ZP;=`<%l$f!^&eWTtohtu&^!Q![&^!c!}&^#R#S&^#T#o&^$g;'S&^;'S;=`&}<%lO&^!^'QP;=`<%l&^~'YP!W~!_!`']x'bO!_x~'gW`~OY'bZw'bwx%Tx#O'b#O#P(P#P;'S'b;'S;=`(}<%lO'b~(SRO;'S'b;'S;=`(];=`O'b~(bX`~OY'bZw'bwx%Tx#O'b#O#P(P#P;'S'b;'S;=`(};=`<%l'b<%lO'b~)QP;=`<%l'b~)YOW~~)_OV~~)dP!X~!_!`']~)lP|~!_!`']~)tOk~~)yQ!Tx!O!P*P!Q![*[d*SP!O!P*Vd*[OYd~*aS_~!Q![*[!g!h*m#R#S*[#X#Y*m~*pS{|*|}!O*|!Q![+V#R#S+V~+PQ!Q![+V#R#S+V~+[Q_~!Q![+V#R#S+V~+g]!VxOY,`Zz,`z{.}{!P,`!P!Q/q!Q!_,`!_!`0Y!`!},`!}#O-i#O#P.h#P;'S,`;'S;=`.w<%lO,`S,eXiSOY,`Z!P,`!P!Q-Q!Q!},`!}#O-i#O#P.h#P;'S,`;'S;=`.w<%lO,`S-VUiS#Z#[-Q#]#^-Q#a#b-Q#g#h-Q#i#j-Q#m#n-QS-lVOY-iZ#O-i#O#P.R#P#Q,`#Q;'S-i;'S;=`.b<%lO-iS.USOY-iZ;'S-i;'S;=`.b<%lO-iS.eP;=`<%l-iS.kSOY,`Z;'S,`;'S;=`.w<%lO,`S.zP;=`<%l,`~/UX#W~iSOY,`Z!P,`!P!Q-Q!Q!},`!}#O-i#O#P.h#P;'S,`;'S;=`.w<%lO,`~/vSP~OY/qZ;'S/q;'S;=`0S<%lO/q~0VP;=`<%l/q|0aX!_xiSOY,`Z!P,`!P!Q-Q!Q!},`!}#O-i#O#P.h#P;'S,`;'S;=`.w<%lO,`~1RX_~!O!P*[!Q![1n!g!h*m#R#S1n#U#V2[#X#Y*m#b#c2V#c#d2y#l#m3b~1sU_~!O!P*[!Q![1n!g!h*m#R#S1n#X#Y*m#b#c2V~2[O_~~2_R!Q!R2h!R!S2h#R#S2h~2mS_~!Q!R2h!R!S2h#R#S2h#b#c2V~2|Q!Q!Y3S#R#S3S~3XR_~!Q!Y3S#R#S3S#b#c2V~3eS!Q![3q!c!i3q#R#S3q#T#Z3q~3vT_~!Q![3q!c!i3q#R#S3q#T#Z3q#b#c2V|4^Os[!]p~4cO!f~~4hQ^~!_!`$X!`!a4n~4sO!R~~4xO![~~4}O[~~5SOZ~~5XO#a~~5^Ol~~5cOb~",
  tokenizers: [noSemicolon, 2, 3, 4, 5, insertSemicolon, new LocalTokenGroup("!W~RRtu[#O#Pg#S#T!Q~_P#o#pb~gOd~~jRO;'Ss;'S;=`x;=`Os~xO#b~~}P#b~;=`<%ls~!VO#d~~", 53, 111), new LocalTokenGroup("j~RQYZXz{^~^O#Y~~aP!P!Qd~iO#Z~~", 25, 101)],
  topRules: { "Script": [0, 3], "SingleExpression": [1, 83] },
  specialized: [{ term: 5, get: (value) => spec_Identifier[value] || -1 }, { term: 31, get: (value) => spec_PropertyName[value] || -1 }],
  tokenPrec: 3240
});

const ScriptLang = LRLanguage.define({
  parser: parser.configure({
    props: [
      indentNodeProp.add({
        Application: delimitedIndent({ closing: "}", align: false })
      }),
      foldNodeProp.add({
        Application: foldInside
      }),
      styleTags({
        // 关键字
        var: tags.definitionKeyword,
        ref: tags.definitionKeyword,
        function: tags.definitionKeyword,
        if: tags.keyword,
        else: tags.keyword,
        elseif: tags.keyword,
        for: tags.keyword,
        while: tags.keyword,
        return: tags.keyword,
        // 变量名
        Identifier: tags.variableName,
        // 变量类型
        BooleanLiteral: tags.bool,
        Number: tags.number,
        String: tags.string,
        // 括号
        "{ }": tags.paren,
        "( )": tags.brace,
        "[ ]": tags.squareBracket,
        // 注释
        LineComment: tags.lineComment,
      })
    ]
  }),
  languageData: {
    commentTokens: { line: "//" }
  }
});
function ScriptLangSupport() {
  return new LanguageSupport(ScriptLang);
}

export { ScriptLang, ScriptLangSupport };
