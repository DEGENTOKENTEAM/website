"use strict";(self.webpackChunktradingview=self.webpackChunktradingview||[]).push([[9498],{43930:(e,t,s)=>{s.r(t),s.d(t,{exportData:()=>d});var l=s(44352),i=s(50151),n=s(28263),o=s(33639),a=s(83421),r=s(89895),c=s(49897);const u={includeTime:!0,includeUserTime:!1,includeSeries:!0,includeDisplayedValues:!1,includedStudies:"all"};function d(e,t={}){const s=Object.assign({},u,t),l={schema:[],data:[],displayedData:[]},a=e.timeScale().points(),d=e.mainSeries(),h=function(e,t){const s=e.allStudies().filter((e=>e.showInObjectTree()));if("all"===t)return s;return s.filter((e=>t.includes(e.id())))}(e,s.includedStudies),T=h.filter((e=>e instanceof r.study_Overlay)).map((e=>e.data()));(s.includeSeries||0===T.length)&&T.push(d.bars());const g=function(e,t,s,l){const a=e.range().value(),r=(0,i.ensureNotNull)(void 0!==s?e.indexOf(s,!0):(0,i.ensureNotNull)(a).firstIndex),c=(0,i.ensureNotNull)(void 0!==l?e.indexOf(l,!0):(0,i.ensureNotNull)(a).lastIndex);let u=c,d=r;for(const e of t){const t=e.search(r,o.PlotRowSearchMode.NearestRight);null!==t&&t.index<u&&(u=t.index);const s=e.search(c,o.PlotRowSearchMode.NearestLeft);null!==s&&s.index>d&&(d=s.index)}return(0,i.assert)(u<=d,"Range must contain at least 1 time point"),new n.BarsRange(u,d)}(a,T,s.from,s.to),y=g.firstBar(),v=g.lastBar();s.includeTime&&l.schema.push({type:"time"});const N=l.schema.length;s.includeUserTime&&l.schema.push({type:"userTime"});const P=l.schema.length;if(s.includeSeries){const e=d.statusProvider({hideResolution:!0}).getSplitTitle(),t=Object.values(e).filter((e=>""!==e)).join(", ");l.schema.push(p("open",t)),l.schema.push(p("high",t)),l.schema.push(p("low",t)),l.schema.push(p("close",t))}let S=l.schema.length;const w=[];for(const e of h){const t=f(e);w.push(t),l.schema.push(...t.fields)}const x=l.schema.length;if(0===x)return l;for(let e=y;e<=v;++e){const e=new Float64Array(x);e.fill(NaN),l.data.push(e),s.includeDisplayedValues&&l.displayedData.push(new Array(x).fill(""))}if(s.includeTime||s.includeUserTime){const t=e.timeScale(),n=e.dateTimeFormatter();for(let e=y;e<=v;++e){s.includeTime&&(l.data[e-y][0]=(0,i.ensureNotNull)(a.valueAt(e)));const o=(0,i.ensureNotNull)(t.indexToUserTime(e));if(s.includeUserTime&&(l.data[e-y][N]=o.getTime()/1e3),s.includeDisplayedValues){const t=n.format(o);s.includeTime&&(l.displayedData[e-y][0]=t),s.includeUserTime&&(l.displayedData[e-y][N]=t)}}}if(s.includeSeries){const e=d.bars().range(y,v),t=(0,c.getPriceValueFormatterForSource)(d);e.each(((e,i)=>{const n=l.data[e-y],o=m(i[1]),a=m(i[2]),r=m(i[3]),c=m(i[4]);if(n[P]=o,n[P+1]=a,n[P+2]=r,n[P+3]=c,s.includeDisplayedValues){const s=l.displayedData[e-y];s[P]=t(o),s[P+1]=t(a),s[P+2]=t(r),s[P+3]=t(c)}return!1}))}for(let e=0;e<h.length;++e){const t=h[e],i=w[e],n=(0,c.getPriceValueFormatterForSource)(t);for(let e=0;e<i.fields.length;++e){const o=i.fieldPlotOffsets[e],a=i.fieldToPlotIndex[e],r=y-o,c=v-o,u=S+e;t.data().range(r,c).each(((e,t)=>{const i=l.data[e-r],o=m(t[a]);return i[u]=o,s.includeDisplayedValues&&(l.displayedData[e-r][u]=n(o)),!1}))}S+=i.fields.length}return l}
function f(e){const t=e.metaInfo(),n={fieldToPlotIndex:[],fieldPlotOffsets:[],fields:[]},o=e.id(),r=e.title(!1,void 0,!1);for(let c=0;c<t.plots.length;++c){const u=t.plots[c];let d,f="";if((0,a.isLinePlot)(u)||(0,a.isShapesPlot)(u)||(0,a.isCharsPlot)(u)||(0,a.isArrowsPlot)(u))d=(0,i.ensureDefined)(t.styles)[u.id];else if((0,a.isOhlcPlot)(u))switch(d=t.ohlcPlots&&t.ohlcPlots[u.target],u.type){case"ohlc_open":f=` (${l.t(null,void 0,s(39280))})`;break;case"ohlc_high":f=` (${l.t(null,void 0,s(30777))}`;break;case"ohlc_low":f=` (${l.t(null,void 0,s(8136))})`;break;case"ohlc_close":f=` (${l.t(null,void 0,s(31691))})`}if(void 0===d||void 0===d.title)continue;const p=`${d.title}${f}`;n.fields.push(h(o,r,p)),n.fieldToPlotIndex.push(c+1),n.fieldPlotOffsets.push(e.offset(u.id))}return n}function h(e,t,s){return{type:"value",sourceType:"study",sourceId:e,sourceTitle:t,plotTitle:s}}function p(e,t){return{type:"value",sourceType:"series",plotTitle:e,sourceTitle:t}}function m(e){return null!=e?e:NaN}}}]);