import{d as y$1,f as z}from"./chunk-eWXhx1GK.js";import"./chunk-B_I09ALh.js";import{$ as El,$t as Jt,Ao as iDt,Bo as im,Br as Ue,Bs as nt,Cr as Ry,D as Be,Ec as ro,En as Mn$1,Er as Se,Fn as Ne,Fr as Tn$1,H as Cr,Ho as ir,Ii as Ye$1,Io as ie,Ir as Tr,Is as nm,Ji as Zn$1,Jn as Ot,Kc as tr,Kl as xn$1,Ko as jE,La as cx,Lo as ii,Lt as Hn$1,M as Br,Ma as ce,Mc as sR,Mi as Y6,Ml as wu,Nl as x,Ns as ni,Ol as wj,Ot as Gv,P as Bw,Ps as nin,R as Ce,Rr as U,Ss as mu,Ti as Xe,Ts as mxe,Ua as dd,Ul as xj,Un as Oa$1,Us as oU,Ut as Il,Vn as O,Vr as Uf,Wc as te,Wn as Of,Xs as on$1,Y as Dn$1,Ya as ee,Yl as xut,Ys as om,Z as E,Zc as ua$1,Zn as P,Zr as Vi$1,_c as qr,_i as Wr,_l as vn$1,_n as Lr,_o as gs,_r as Re,aa as _v,ac as pe,ai as Vt,at as F,bl as vt,bo as ha$1,br as Rn$1,ct as FSe,d as $n$1,da as ae,dl as vc,dr as Qen,ea as _h,ec as ot,el as ug,er as Pe,es as ke,eu as ye,fo as ge,gc as qn$1,gn as Lo,go as gr,gu as zn$1,ho as got,hr as Qt,hs as mR,ir as Pt,is as kt$1,it as Es,j as Bn$1,ji as Xx,jl as wt,jn as NR,jr as T,js as ne,ki as Xt,kt as H,li as WA,ls as li,lt as Fe,mo as go,nc as p,ni as Vo,ns as ki$1,ol as ut,oo as fn,or as Q,ou as yv,pu as ze,qa as eI,ql as xr,qr as Va$1,r as $F,ra as _s,ro as fe,rr as Po,ru as yn$1,s as $e,sc as pn,si as W,sn as Ke$1,sr as Q0,t as $,ta as _i,ti as Vn$1,tn as K,uc as pw,un as La$1,vi as Wt,vl as von,vr as Rf,vs as me,wa as bn,ws as mw,wt as Gi,x as B,xa as be,xc as rc,xs as mt,xt as Ge,y as At,yc as qx,yi as X,z as Ci,zs as nr,zt as Ht}from"./chunk-CdmSafof.js";import{A as Wi,D as Ra$1,F as fr,G as qt,H as ov,I as gn$1,J as tr$1,L as gr$1,O as Ru,P as er,X as xl,_ as ue,f as Fe$1,g as je,h as Wo,j as _r,k as Ua$1,m as Ue$1,p as Rr,v as xa$1,y as xr$1}from"./main.js";var y=(function(e){return e[e.START=1]=`START`,e[e.END=2]=`END`,e})(y||{});var kt=(function(e){return e[e.ACTIVE=0]=`ACTIVE`,e[e.INACTIVE=1]=`INACTIVE`,e})(kt||{});var wi=new ee(`_MatSlider`);var Qe=new ee(`_MatSliderThumb`);var _n=new ee(`_MatSliderRangeThumb`);var qe=new ee(`_MatSliderVisualThumb`);var gn=(()=>{class e{_cdr=p(ut);_ngZone=p(Ke$1);_slider=p(wi);_renderer=p(Xt);_listenerCleanups;discrete=!1;thumbPosition;valueIndicatorText;_ripple;_knob;_valueIndicatorContainer;_sliderInput;_sliderInputEl;_hoverRippleRef;_focusRippleRef;_activeRippleRef;_isHovered=!1;_isActive=!1;_isValueIndicatorVisible=!1;_hostElement=p(ke).nativeElement;_platform=p(pn);ngAfterViewInit(){let t=this._slider._getInput(this.thumbPosition);t&&(this._ripple.radius=24,this._sliderInput=t,this._sliderInputEl=this._sliderInput._hostElement,this._ngZone.runOutsideAngular(()=>{let i=this._sliderInputEl,n=this._renderer;this._listenerCleanups=[n.listen(i,`pointermove`,this._onPointerMove),n.listen(i,`pointerdown`,this._onDragStart),n.listen(i,`pointerup`,this._onDragEnd),n.listen(i,`pointerleave`,this._onMouseLeave),n.listen(i,`focus`,this._onFocus),n.listen(i,`blur`,this._onBlur)]}))}ngOnDestroy(){this._listenerCleanups?.forEach(t=>t())}_onPointerMove=t=>{if(this._sliderInput._isFocused)return;let i=this._hostElement.getBoundingClientRect(),n=this._slider._isCursorOnSliderThumb(t,i);this._isHovered=n,n?this._showHoverRipple():this._hideRipple(this._hoverRippleRef)};_onMouseLeave=()=>{this._isHovered=!1,this._hideRipple(this._hoverRippleRef)};_onFocus=()=>{this._hideRipple(this._hoverRippleRef),this._showFocusRipple(),this._hostElement.classList.add(`mdc-slider__thumb--focused`)};_onBlur=()=>{this._isActive||this._hideRipple(this._focusRippleRef),this._isHovered&&this._showHoverRipple(),this._hostElement.classList.remove(`mdc-slider__thumb--focused`)};_onDragStart=t=>{t.button===0&&(this._isActive=!0,this._showActiveRipple())};_onDragEnd=()=>{this._isActive=!1,this._hideRipple(this._activeRippleRef),this._sliderInput._isFocused||this._hideRipple(this._focusRippleRef),this._platform.SAFARI&&this._showHoverRipple()};_showHoverRipple(){this._isShowingRipple(this._hoverRippleRef)||(this._hoverRippleRef=this._showRipple({enterDuration:0,exitDuration:0}),this._hoverRippleRef?.element.classList.add(`mat-mdc-slider-hover-ripple`))}_showFocusRipple(){this._isShowingRipple(this._focusRippleRef)||(this._focusRippleRef=this._showRipple({enterDuration:0,exitDuration:0},!0),this._focusRippleRef?.element.classList.add(`mat-mdc-slider-focus-ripple`))}_showActiveRipple(){this._isShowingRipple(this._activeRippleRef)||(this._activeRippleRef=this._showRipple({enterDuration:225,exitDuration:400}),this._activeRippleRef?.element.classList.add(`mat-mdc-slider-active-ripple`))}_isShowingRipple(t){return t?.state===La$1.FADING_IN||t?.state===La$1.VISIBLE}_showRipple(t,i){if(!this._slider.disabled&&(this._showValueIndicator(),this._slider._isRange&&this._slider._getThumb(this.thumbPosition===y.START?y.END:y.START)._showValueIndicator(),!(this._slider._globalRippleOptions?.disabled&&!i)))return this._ripple.launch({animation:this._slider._noopAnimations?{enterDuration:0,exitDuration:0}:t,centered:!0,persistent:!0})}_hideRipple(t){if(t?.fadeOut(),this._isShowingAnyRipple())return;this._slider._isRange||this._hideValueIndicator();let i=this._getSibling();i._isShowingAnyRipple()||(this._hideValueIndicator(),i._hideValueIndicator())}_showValueIndicator(){this._hostElement.classList.add(`mdc-slider__thumb--with-indicator`)}_hideValueIndicator(){this._hostElement.classList.remove(`mdc-slider__thumb--with-indicator`)}_getSibling(){return this._slider._getThumb(this.thumbPosition===y.START?y.END:y.START)}_getValueIndicatorContainer(){return this._valueIndicatorContainer?.nativeElement}_getKnob(){return this._knob.nativeElement}_isShowingAnyRipple(){return this._isShowingRipple(this._hoverRippleRef)||this._isShowingRipple(this._focusRippleRef)||this._isShowingRipple(this._activeRippleRef)}static ɵfac=function(i){return new(i||e)};static ɵcmp=(function(){let t=[`knob`],i=[`valueIndicatorContainer`];function n(a,c){if(a&1&&(E(0,`div`,2,1)(2,`div`,5)(3,`span`,6),H(4),T()()()),a&2){let d=F();x(4),ze(d.valueIndicatorText)}}return te({type:e,selectors:[[`mat-slider-visual-thumb`]],viewQuery:function(c,d){if(c&1&&on$1(Va$1,5)(t,5)(i,5),c&2){let p;$e(p=Ge())&&(d._ripple=p.first),$e(p=Ge())&&(d._knob=p.first),$e(p=Ge())&&(d._valueIndicatorContainer=p.first)}},hostAttrs:[1,`mdc-slider__thumb`,`mat-mdc-slider-visual-thumb`],inputs:{discrete:`discrete`,thumbPosition:`thumbPosition`,valueIndicatorText:`valueIndicatorText`},features:[vt([{provide:qe,useExisting:e}])],decls:4,vars:2,consts:[[`knob`,``],[`valueIndicatorContainer`,``],[1,`mdc-slider__value-indicator-container`],[1,`mdc-slider__thumb-knob`],[`matRipple`,``,1,`mat-focus-indicator`,3,`matRippleDisabled`],[1,`mdc-slider__value-indicator`],[1,`mdc-slider__value-indicator-text`]],template:function(c,d){c&1&&(ne(0,n,5,1,`div`,2),Ne(1,`div`,3,0)(3,`div`,4)),c&2&&(ie(d.discrete?0:-1),x(3),K(`matRippleDisabled`,!0))},dependencies:[Va$1],styles:[`.mat-mdc-slider-visual-thumb .mat-ripple {
  height: 100%;
  width: 100%;
}

.mat-mdc-slider .mdc-slider__tick-marks {
  justify-content: start;
}
.mat-mdc-slider .mdc-slider__tick-marks .mdc-slider__tick-mark--active,
.mat-mdc-slider .mdc-slider__tick-marks .mdc-slider__tick-mark--inactive {
  position: absolute;
  left: 2px;
}
`],encapsulation:2})})()}return e})();var Ke=(()=>{class e{_ngZone=p(Ke$1);_cdr=p(ut);_elementRef=p(ke);_dir=p(ii,{optional:!0});_globalRippleOptions=p(Rf,{optional:!0});_trackActive;_thumbs;_input;_inputs;get disabled(){return this._disabled}set disabled(t){this._disabled=t;let i=this._getInput(y.END),n=this._getInput(y.START);i&&(i.disabled=this._disabled),n&&(n.disabled=this._disabled)}_disabled=!1;get discrete(){return this._discrete}set discrete(t){this._discrete=t,this._updateValueIndicatorUIs()}_discrete=!1;get showTickMarks(){return this._showTickMarks}set showTickMarks(t){this._showTickMarks=t,this._hasViewInitialized&&(this._updateTickMarkUI(),this._updateTickMarkTrackUI())}_showTickMarks=!1;get min(){return this._min}set min(t){let i=t==null||isNaN(t)?this._min:t;this._min!==i&&this._updateMin(i)}_min=0;color;disableRipple=!1;_updateMin(t){let i=this._min;this._min=t,this._isRange?this._updateMinRange({old:i,new:t}):this._updateMinNonRange(t),this._onMinMaxOrStepChange()}_updateMinRange(t){let i=this._getInput(y.END),n=this._getInput(y.START),a=i.value,c=n.value;n.min=t.new,i.min=Math.max(t.new,n.value),n.max=Math.min(i.max,i.value),n._updateWidthInactive(),i._updateWidthInactive(),t.new<t.old?this._onTranslateXChangeBySideEffect(i,n):this._onTranslateXChangeBySideEffect(n,i),a!==i.value&&this._onValueChange(i),c!==n.value&&this._onValueChange(n)}_updateMinNonRange(t){let i=this._getInput(y.END);if(i){let n=i.value;i.min=t,i._updateThumbUIByValue(),this._updateTrackUI(i),n!==i.value&&this._onValueChange(i)}}get max(){return this._max}set max(t){let i=t==null||isNaN(t)?this._max:t;this._max!==i&&this._updateMax(i)}_max=100;_updateMax(t){let i=this._max;this._max=t,this._isRange?this._updateMaxRange({old:i,new:t}):this._updateMaxNonRange(t),this._onMinMaxOrStepChange()}_updateMaxRange(t){let i=this._getInput(y.END),n=this._getInput(y.START),a=i.value,c=n.value;i.max=t.new,n.max=Math.min(t.new,i.value),i.min=n.value,i._updateWidthInactive(),n._updateWidthInactive(),t.new>t.old?this._onTranslateXChangeBySideEffect(n,i):this._onTranslateXChangeBySideEffect(i,n),a!==i.value&&this._onValueChange(i),c!==n.value&&this._onValueChange(n)}_updateMaxNonRange(t){let i=this._getInput(y.END);if(i){let n=i.value;i.max=t,i._updateThumbUIByValue(),this._updateTrackUI(i),n!==i.value&&this._onValueChange(i)}}get step(){return this._step}set step(t){let i=isNaN(t)?this._step:t;this._step!==i&&this._updateStep(i)}_step=1;_updateStep(t){this._step=t,this._isRange?this._updateStepRange():this._updateStepNonRange(),this._onMinMaxOrStepChange()}_updateStepRange(){let t=this._getInput(y.END),i=this._getInput(y.START),n=t.value,a=i.value,c=i.value;t.min=this._min,i.max=this._max,t.step=this._step,i.step=this._step,this._platform.SAFARI&&(t.value=t.value,i.value=i.value),t.min=Math.max(this._min,i.value),i.max=Math.min(this._max,t.value),i._updateWidthInactive(),t._updateWidthInactive(),t.value<c?this._onTranslateXChangeBySideEffect(i,t):this._onTranslateXChangeBySideEffect(t,i),n!==t.value&&this._onValueChange(t),a!==i.value&&this._onValueChange(i)}_updateStepNonRange(){let t=this._getInput(y.END);if(t){let i=t.value;t.step=this._step,this._platform.SAFARI&&(t.value=t.value),t._updateThumbUIByValue(),i!==t.value&&this._onValueChange(t)}}displayWith=t=>`${t}`;_tickMarks;_noopAnimations=fn();_resizeObserver=null;_cachedWidth;_cachedLeft;_rippleRadius=24;startValueIndicatorText=``;endValueIndicatorText=``;_endThumbTransform;_startThumbTransform;_isRange=!1;_isRtl=P(()=>this._dir?.valueSignal()===`rtl`);_hasViewInitialized=!1;_tickMarkTrackWidth=0;_hasAnimation=!1;_resizeTimer=null;_platform=p(pn);constructor(){p(Dn$1).load(Br);let t=this._isRtl();om(()=>{let i=this._isRtl();i!==t&&(t=i,this._isRange?this._onDirChangeRange():this._onDirChangeNonRange(),this._updateTickMarkUI())})}_knobRadius=8;_inputPadding;ngAfterViewInit(){this._platform.isBrowser&&this._updateDimensions();let t=this._getInput(y.END),i=this._getInput(y.START);this._isRange=!!t&&!!i,this._cdr.detectChanges();let n=this._getThumb(y.END);this._rippleRadius=n._ripple.radius,this._inputPadding=this._rippleRadius-this._knobRadius,this._isRange?this._initUIRange(t,i):this._initUINonRange(t),this._updateTrackUI(t),this._updateTickMarkUI(),this._updateTickMarkTrackUI(),this._observeHostResize(),this._cdr.detectChanges()}_initUINonRange(t){t.initProps(),t.initUI(),this._updateValueIndicatorUI(t),this._hasViewInitialized=!0,t._updateThumbUIByValue()}_initUIRange(t,i){t.initProps(),t.initUI(),i.initProps(),i.initUI(),t._updateMinMax(),i._updateMinMax(),t._updateStaticStyles(),i._updateStaticStyles(),this._updateValueIndicatorUIs(),this._hasViewInitialized=!0,t._updateThumbUIByValue(),i._updateThumbUIByValue()}ngOnDestroy(){this._resizeObserver?.disconnect(),this._resizeObserver=null}_onDirChangeRange(){let t=this._getInput(y.END),i=this._getInput(y.START);t._setIsLeftThumb(),i._setIsLeftThumb(),t.translateX=t._calcTranslateXByValue(),i.translateX=i._calcTranslateXByValue(),t._updateStaticStyles(),i._updateStaticStyles(),t._updateWidthInactive(),i._updateWidthInactive(),t._updateThumbUIByValue(),i._updateThumbUIByValue()}_onDirChangeNonRange(){this._getInput(y.END)._updateThumbUIByValue()}_observeHostResize(){typeof ResizeObserver>`u`||!ResizeObserver||this._ngZone.runOutsideAngular(()=>{this._resizeObserver=new ResizeObserver(()=>{this._isActive()||(this._resizeTimer&&clearTimeout(this._resizeTimer),this._onResize())}),this._resizeObserver.observe(this._elementRef.nativeElement)})}_isActive(){return this._getThumb(y.START)._isActive||this._getThumb(y.END)._isActive}_getValue(t=y.END){let i=this._getInput(t);return i?i.value:this.min}_skipUpdate(){return!!(this._getInput(y.START)?._skipUIUpdate||this._getInput(y.END)?._skipUIUpdate)}_updateDimensions(){this._cachedWidth=this._elementRef.nativeElement.offsetWidth,this._cachedLeft=this._elementRef.nativeElement.getBoundingClientRect().left}_setTrackActiveStyles(t){let i=this._trackActive.nativeElement.style;i.left=t.left,i.right=t.right,i.transformOrigin=t.transformOrigin,i.transform=t.transform}_calcTickMarkTransform(t){let i=t*(this._tickMarkTrackWidth/(this._tickMarks.length-1));return`translateX(${this._isRtl()?this._cachedWidth-6-i:i}px)`}_onTranslateXChange(t){this._hasViewInitialized&&(this._updateThumbUI(t),this._updateTrackUI(t),this._updateOverlappingThumbUI(t))}_onTranslateXChangeBySideEffect(t,i){this._hasViewInitialized&&(t._updateThumbUIByValue(),i._updateThumbUIByValue())}_onValueChange(t){this._hasViewInitialized&&(this._updateValueIndicatorUI(t),this._updateTickMarkUI(),this._cdr.detectChanges())}_onMinMaxOrStepChange(){this._hasViewInitialized&&(this._updateTickMarkUI(),this._updateTickMarkTrackUI(),this._cdr.markForCheck())}_onResize(){if(this._hasViewInitialized){if(this._updateDimensions(),this._isRange){let t=this._getInput(y.END),i=this._getInput(y.START);t._updateThumbUIByValue(),i._updateThumbUIByValue(),t._updateStaticStyles(),i._updateStaticStyles(),t._updateMinMax(),i._updateMinMax(),t._updateWidthInactive(),i._updateWidthInactive()}else{let t=this._getInput(y.END);t&&t._updateThumbUIByValue()}this._updateTickMarkUI(),this._updateTickMarkTrackUI(),this._cdr.detectChanges()}}_thumbsOverlap=!1;_areThumbsOverlapping(){let t=this._getInput(y.START),i=this._getInput(y.END);return!t||!i?!1:i.translateX-t.translateX<20}_updateOverlappingThumbClassNames(t){let i=t.getSibling(),n=this._getThumb(t.thumbPosition);this._getThumb(i.thumbPosition)._hostElement.classList.remove(`mdc-slider__thumb--top`),n._hostElement.classList.toggle(`mdc-slider__thumb--top`,this._thumbsOverlap)}_updateOverlappingThumbUI(t){!this._isRange||this._skipUpdate()||this._thumbsOverlap!==this._areThumbsOverlapping()&&(this._thumbsOverlap=!this._thumbsOverlap,this._updateOverlappingThumbClassNames(t))}_updateThumbUI(t){if(this._skipUpdate())return;let i=this._getThumb(t.thumbPosition===y.END?y.END:y.START);i._hostElement.style.transform=`translateX(${t.translateX}px)`}_updateValueIndicatorUI(t){if(this._skipUpdate())return;let i=this.displayWith(t.value);if(this._hasViewInitialized?t._valuetext.set(i):t._hostElement.setAttribute(`aria-valuetext`,i),this.discrete){t.thumbPosition===y.START?this.startValueIndicatorText=i:this.endValueIndicatorText=i;let n=this._getThumb(t.thumbPosition);i.length<3?n._hostElement.classList.add(`mdc-slider__thumb--short-value`):n._hostElement.classList.remove(`mdc-slider__thumb--short-value`)}}_updateValueIndicatorUIs(){let t=this._getInput(y.END),i=this._getInput(y.START);t&&this._updateValueIndicatorUI(t),i&&this._updateValueIndicatorUI(i)}_updateTickMarkTrackUI(){if(!this.showTickMarks||this._skipUpdate())return;let t=this._step&&this._step>0?this._step:1,n=(Math.floor(this.max/t)*t-this.min)/(this.max-this.min);this._tickMarkTrackWidth=(this._cachedWidth-6)*n}_updateTrackUI(t){this._skipUpdate()||(this._isRange?this._updateTrackUIRange(t):this._updateTrackUINonRange(t))}_updateTrackUIRange(t){let i=t.getSibling();if(!i||!this._cachedWidth)return;let n=Math.abs(i.translateX-t.translateX)/this._cachedWidth;t._isLeftThumb&&this._cachedWidth?this._setTrackActiveStyles({left:`auto`,right:`${this._cachedWidth-i.translateX}px`,transformOrigin:`right`,transform:`scaleX(${n})`}):this._setTrackActiveStyles({left:`${i.translateX}px`,right:`auto`,transformOrigin:`left`,transform:`scaleX(${n})`})}_updateTrackUINonRange(t){this._isRtl()?this._setTrackActiveStyles({left:`auto`,right:`0px`,transformOrigin:`right`,transform:`scaleX(${1-t.fillPercentage})`}):this._setTrackActiveStyles({left:`0px`,right:`auto`,transformOrigin:`left`,transform:`scaleX(${t.fillPercentage})`})}_updateTickMarkUI(){if(!this.showTickMarks||this.step===void 0||this.min===void 0||this.max===void 0)return;let t=this.step>0?this.step:1;this._isRange?this._updateTickMarkUIRange(t):this._updateTickMarkUINonRange(t)}_updateTickMarkUINonRange(t){let i=this._getValue(),n=Math.max(Math.round((i-this.min)/t),0)+1,a=Math.max(Math.round((this.max-i)/t),0)-1;this._isRtl()?n++:a++,this._tickMarks=Array(n).fill(kt.ACTIVE).concat(Array(a).fill(kt.INACTIVE))}_updateTickMarkUIRange(t){let i=this._getValue(),n=this._getValue(y.START),a=Math.max(Math.round((n-this.min)/t),0),c=Math.max(Math.round((i-n)/t)+1,0),d=Math.max(Math.round((this.max-i)/t),0);this._tickMarks=Array(a).fill(kt.INACTIVE).concat(Array(c).fill(kt.ACTIVE),Array(d).fill(kt.INACTIVE))}_getInput(t){if(t===y.END&&this._input)return this._input;if(this._inputs?.length)return t===y.START?this._inputs.first:this._inputs.last}_getThumb(t){return t===y.END?this._thumbs?.last:this._thumbs?.first}_setTransition(t){this._hasAnimation=!this._platform.IOS&&t&&!this._noopAnimations,this._elementRef.nativeElement.classList.toggle(`mat-mdc-slider-with-animation`,this._hasAnimation)}_isCursorOnSliderThumb(t,i){let n=i.width/2,a=i.x+n,c=i.y+n,d=t.clientX-a,p=t.clientY-c;return Math.pow(d,2)+Math.pow(p,2)<Math.pow(n,2)}static ɵfac=function(i){return new(i||e)};static ɵcmp=(function(){let t=[`trackActive`],i=[`*`];function n(p,S){if(p&1&&Ne(0,`div`),p&2){let w=S.$implicit,F$1=S.$index,pt=F(3);Mn$1(w===0?`mdc-slider__tick-mark--active`:`mdc-slider__tick-mark--inactive`),Cr(`transform`,pt._calcTickMarkTransform(F$1))}}function a(p,S){if(p&1&&Vn$1(0,n,1,4,`div`,8,im),p&2){let w=F(2);Bn$1(w._tickMarks)}}function c(p,S){if(p&1&&(E(0,`div`,6,1),ne(2,a,2,0),T()),p&2){let w=F();x(2),ie(w._cachedWidth?2:-1)}}function d(p,S){if(p&1&&Ne(0,`mat-slider-visual-thumb`,7),p&2){let w=F();K(`discrete`,w.discrete)(`thumbPosition`,1)(`valueIndicatorText`,w.startValueIndicatorText)}}return te({type:e,selectors:[[`mat-slider`]],contentQueries:function(S,w,F){if(S&1&&Vi$1(F,Qe,5)(F,_n,4),S&2){let pt;$e(pt=Ge())&&(w._input=pt.first),$e(pt=Ge())&&(w._inputs=pt)}},viewQuery:function(S,w){if(S&1&&on$1(t,5)(qe,5),S&2){let F;$e(F=Ge())&&(w._trackActive=F.first),$e(F=Ge())&&(w._thumbs=F)}},hostAttrs:[1,`mat-mdc-slider`,`mdc-slider`],hostVars:12,hostBindings:function(S,w){S&2&&(Mn$1(`mat-`+(w.color||`primary`)),ge(`mdc-slider--range`,w._isRange)(`mdc-slider--disabled`,w.disabled)(`mdc-slider--discrete`,w.discrete)(`mdc-slider--tick-marks`,w.showTickMarks)(`_mat-animation-noopable`,w._noopAnimations))},inputs:{disabled:[2,`disabled`,`disabled`,ye],discrete:[2,`discrete`,`discrete`,ye],showTickMarks:[2,`showTickMarks`,`showTickMarks`,ye],min:[2,`min`,`min`,ir],color:`color`,disableRipple:[2,`disableRipple`,`disableRipple`,ye],max:[2,`max`,`max`,ir],step:[2,`step`,`step`,ir],displayWith:`displayWith`},exportAs:[`matSlider`],features:[vt([{provide:wi,useExisting:e}])],ngContentSelectors:i,decls:9,vars:5,consts:[[`trackActive`,``],[`tickMarkContainer`,``],[1,`mdc-slider__track`],[1,`mdc-slider__track--inactive`],[1,`mdc-slider__track--active`],[1,`mdc-slider__track--active_fill`],[1,`mdc-slider__tick-marks`],[3,`discrete`,`thumbPosition`,`valueIndicatorText`],[3,`class`,`transform`]],template:function(S,w){S&1&&(Pt(),Ye$1(0),E(1,`div`,2),Ne(2,`div`,3),E(3,`div`,4),Ne(4,`div`,5,0),T(),ne(6,c,3,1,`div`,6),T(),ne(7,d,1,3,`mat-slider-visual-thumb`,7),Ne(8,`mat-slider-visual-thumb`,7)),S&2&&(x(6),ie(w.showTickMarks?6:-1),x(),ie(w._isRange?7:-1),x(),K(`discrete`,w.discrete)(`thumbPosition`,2)(`valueIndicatorText`,w.endValueIndicatorText))},dependencies:[gn],styles:[`.mdc-slider__track {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
  pointer-events: none;
  height: var(--%NS%mat-slider-inactive-track-height, 4px);
}

.mdc-slider__track--active,
.mdc-slider__track--inactive {
  display: flex;
  height: 100%;
  position: absolute;
  width: 100%;
}

.mdc-slider__track--active {
  overflow: hidden;
  border-radius: var(--%NS%mat-slider-active-track-shape, var(--%NS%mat-sys-corner-full));
  height: var(--%NS%mat-slider-active-track-height, 4px);
  top: calc((var(--%NS%mat-slider-inactive-track-height, 4px) - var(--%NS%mat-slider-active-track-height, 4px)) / 2);
}

.mdc-slider__track--active_fill {
  border-top-style: solid;
  box-sizing: border-box;
  height: 100%;
  width: 100%;
  position: relative;
  transform-origin: left;
  transition: transform 80ms ease;
  border-color: var(--%NS%mat-slider-active-track-color, var(--%NS%mat-sys-primary));
  border-top-width: var(--%NS%mat-slider-active-track-height, 4px);
}
.mdc-slider--disabled .mdc-slider__track--active_fill {
  border-color: var(--%NS%mat-slider-disabled-active-track-color, var(--%NS%mat-sys-on-surface));
}
[dir=rtl] .mdc-slider__track--active_fill {
  -webkit-transform-origin: right;
  transform-origin: right;
}

.mdc-slider__track--inactive {
  left: 0;
  top: 0;
  opacity: 0.24;
  background-color: var(--%NS%mat-slider-inactive-track-color, var(--%NS%mat-sys-surface-variant));
  height: var(--%NS%mat-slider-inactive-track-height, 4px);
  border-radius: var(--%NS%mat-slider-inactive-track-shape, var(--%NS%mat-sys-corner-full));
}
.mdc-slider--disabled .mdc-slider__track--inactive {
  background-color: var(--%NS%mat-slider-disabled-inactive-track-color, var(--%NS%mat-sys-on-surface));
  opacity: 0.24;
}
.mdc-slider__track--%NS%inactive::before {
  position: absolute;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  border: 1px solid transparent;
  border-radius: inherit;
  content: "";
  pointer-events: none;
}
@media (forced-colors: active) {
  .mdc-slider__track--%NS%inactive::before {
    border-color: CanvasText;
  }
}

.mdc-slider__value-indicator-container {
  bottom: 44px;
  left: 50%;
  pointer-events: none;
  position: absolute;
  transform: var(--%NS%mat-slider-value-indicator-container-transform, translateX(-50%) rotate(-45deg));
}
.mdc-slider__thumb--with-indicator .mdc-slider__value-indicator-container {
  pointer-events: auto;
}

.mdc-slider__value-indicator {
  display: flex;
  align-items: center;
  transform: scale(0);
  transform-origin: var(--%NS%mat-slider-value-indicator-transform-origin, 0 28px);
  transition: transform 100ms cubic-bezier(0.4, 0, 1, 1);
  word-break: normal;
  background-color: var(--%NS%mat-slider-label-container-color, var(--%NS%mat-sys-primary));
  color: var(--%NS%mat-slider-label-label-text-color, var(--%NS%mat-sys-on-primary));
  width: var(--%NS%mat-slider-value-indicator-width, 28px);
  height: var(--%NS%mat-slider-value-indicator-height, 28px);
  padding: var(--%NS%mat-slider-value-indicator-padding, 0);
  opacity: var(--%NS%mat-slider-value-indicator-opacity, 1);
  border-radius: var(--%NS%mat-slider-value-indicator-border-radius, 50% 50% 50% 0);
}
.mdc-slider__thumb--with-indicator .mdc-slider__value-indicator {
  transition: transform 100ms cubic-bezier(0, 0, 0.2, 1);
  transform: scale(1);
}
.mdc-slider__value-indicator::before {
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid;
  bottom: -5px;
  content: "";
  height: 0;
  left: 50%;
  position: absolute;
  transform: translateX(-50%);
  width: 0;
  display: var(--%NS%mat-slider-value-indicator-caret-display, none);
  border-top-color: var(--%NS%mat-slider-label-container-color, var(--%NS%mat-sys-primary));
}
.mdc-slider__value-indicator::after {
  position: absolute;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  border: 1px solid transparent;
  border-radius: inherit;
  content: "";
  pointer-events: none;
}
@media (forced-colors: active) {
  .mdc-slider__value-indicator::after {
    border-color: CanvasText;
  }
}

.mdc-slider__value-indicator-text {
  text-align: center;
  width: var(--%NS%mat-slider-value-indicator-width, 28px);
  transform: var(--%NS%mat-slider-value-indicator-text-transform, rotate(45deg));
  font-family: var(--%NS%mat-slider-label-label-text-font, var(--%NS%mat-sys-label-medium-font));
  font-size: var(--%NS%mat-slider-label-label-text-size, var(--%NS%mat-sys-label-medium-size));
  font-weight: var(--%NS%mat-slider-label-label-text-weight, var(--%NS%mat-sys-label-medium-weight));
  line-height: var(--%NS%mat-slider-label-label-text-line-height, var(--%NS%mat-sys-label-medium-line-height));
  letter-spacing: var(--%NS%mat-slider-label-label-text-tracking, var(--%NS%mat-sys-label-medium-tracking));
}

.mdc-slider__thumb {
  -webkit-user-select: none;
  user-select: none;
  display: flex;
  left: -24px;
  outline: none;
  position: absolute;
  height: 48px;
  width: 48px;
  pointer-events: none;
}
.mdc-slider--discrete .mdc-slider__thumb {
  transition: transform 80ms ease;
}
.mdc-slider--disabled .mdc-slider__thumb {
  pointer-events: none;
}

.mdc-slider__thumb--top {
  z-index: 1;
}

.mdc-slider__thumb-knob {
  position: absolute;
  box-sizing: border-box;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border-style: solid;
  width: var(--%NS%mat-slider-handle-width, 20px);
  height: var(--%NS%mat-slider-handle-height, 20px);
  border-width: calc(var(--%NS%mat-slider-handle-height, 20px) / 2) calc(var(--%NS%mat-slider-handle-width, 20px) / 2);
  box-shadow: var(--%NS%mat-slider-handle-elevation, var(--%NS%mat-sys-level1));
  background-color: var(--%NS%mat-slider-handle-color, var(--%NS%mat-sys-primary));
  border-color: var(--%NS%mat-slider-handle-color, var(--%NS%mat-sys-primary));
  border-radius: var(--%NS%mat-slider-handle-shape, var(--%NS%mat-sys-corner-full));
}
.mdc-slider__thumb:hover .mdc-slider__thumb-knob {
  background-color: var(--%NS%mat-slider-hover-handle-color, var(--%NS%mat-sys-primary));
  border-color: var(--%NS%mat-slider-hover-handle-color, var(--%NS%mat-sys-primary));
}
.mdc-slider__thumb--focused .mdc-slider__thumb-knob {
  background-color: var(--%NS%mat-slider-focus-handle-color, var(--%NS%mat-sys-primary));
  border-color: var(--%NS%mat-slider-focus-handle-color, var(--%NS%mat-sys-primary));
}
.mdc-slider--disabled .mdc-slider__thumb-knob {
  background-color: var(--%NS%mat-slider-disabled-handle-color, var(--%NS%mat-sys-on-surface));
  border-color: var(--%NS%mat-slider-disabled-handle-color, var(--%NS%mat-sys-on-surface));
}
.mdc-slider__thumb--top .mdc-slider__thumb-knob, .mdc-slider__thumb--top.mdc-slider__thumb:hover .mdc-slider__thumb-knob, .mdc-slider__thumb--top.mdc-slider__thumb--focused .mdc-slider__thumb-knob {
  border: solid 1px #fff;
  box-sizing: content-box;
  border-color: var(--%NS%mat-slider-with-overlap-handle-outline-color, var(--%NS%mat-sys-on-primary));
  border-width: var(--%NS%mat-slider-with-overlap-handle-outline-width, 1px);
}

.mdc-slider__tick-marks {
  align-items: center;
  box-sizing: border-box;
  display: flex;
  height: 100%;
  justify-content: space-between;
  padding: 0 1px;
  position: absolute;
  width: 100%;
}

.mdc-slider__tick-mark--active,
.mdc-slider__tick-mark--inactive {
  width: var(--%NS%mat-slider-with-tick-marks-container-size, 2px);
  height: var(--%NS%mat-slider-with-tick-marks-container-size, 2px);
  border-radius: var(--%NS%mat-slider-with-tick-marks-container-shape, var(--%NS%mat-sys-corner-full));
}

.mdc-slider__tick-mark--inactive {
  opacity: var(--%NS%mat-slider-with-tick-marks-inactive-container-opacity, 0.38);
  background-color: var(--%NS%mat-slider-with-tick-marks-inactive-container-color, var(--%NS%mat-sys-on-surface-variant));
}
.mdc-slider--disabled .mdc-slider__tick-mark--inactive {
  opacity: var(--%NS%mat-slider-with-tick-marks-inactive-container-opacity, 0.38);
  background-color: var(--%NS%mat-slider-with-tick-marks-disabled-container-color, var(--%NS%mat-sys-on-surface));
}

.mdc-slider__tick-mark--active {
  opacity: var(--%NS%mat-slider-with-tick-marks-active-container-opacity, 0.38);
  background-color: var(--%NS%mat-slider-with-tick-marks-active-container-color, var(--%NS%mat-sys-on-primary));
}

.mdc-slider__input {
  cursor: pointer;
  left: 2px;
  margin: 0;
  height: 44px;
  opacity: 0;
  position: absolute;
  top: 2px;
  width: 44px;
  box-sizing: content-box;
}
.mdc-slider__input.mat-mdc-slider-input-no-pointer-events {
  pointer-events: none;
}
.mdc-slider__input.mat-slider__right-input {
  left: auto;
  right: 0;
}

.mat-mdc-slider {
  display: inline-block;
  box-sizing: border-box;
  outline: none;
  vertical-align: middle;
  cursor: pointer;
  height: 48px;
  margin: 0 8px;
  position: relative;
  touch-action: pan-y;
  width: auto;
  min-width: 112px;
  -webkit-tap-highlight-color: transparent;
}
.mat-mdc-slider.mdc-slider--disabled {
  cursor: auto;
  opacity: 0.38;
}
.mat-mdc-slider.mdc-slider--disabled .mdc-slider__input {
  cursor: auto;
}
.mat-mdc-slider .mdc-slider__thumb,
.mat-mdc-slider .mdc-slider__track--active_fill {
  transition-duration: 0ms;
}
.mat-mdc-slider.mat-mdc-slider-with-animation .mdc-slider__thumb,
.mat-mdc-slider.mat-mdc-slider-with-animation .mdc-slider__track--active_fill {
  transition-duration: 80ms;
}
.mat-mdc-slider.mdc-slider--discrete .mdc-slider__thumb,
.mat-mdc-slider.mdc-slider--discrete .mdc-slider__track--active_fill {
  transition-duration: 0ms;
}
.mat-mdc-slider.mat-mdc-slider-with-animation .mdc-slider__thumb,
.mat-mdc-slider.mat-mdc-slider-with-animation .mdc-slider__track--active_fill {
  transition-duration: 80ms;
}
.mat-mdc-slider .mat-ripple .mat-ripple-element {
  background-color: var(--%NS%mat-slider-ripple-color, var(--%NS%mat-sys-primary));
}
.mat-mdc-slider .mat-ripple .mat-mdc-slider-hover-ripple {
  background-color: var(--%NS%mat-slider-hover-state-layer-color, color-mix(in srgb, var(--%NS%mat-sys-primary) 5%, transparent));
}
.mat-mdc-slider .mat-ripple .mat-mdc-slider-focus-ripple,
.mat-mdc-slider .mat-ripple .mat-mdc-slider-active-ripple {
  background-color: var(--%NS%mat-slider-focus-state-layer-color, color-mix(in srgb, var(--%NS%mat-sys-primary) 20%, transparent));
}
.mat-mdc-slider._mat-animation-noopable.mdc-slider--discrete .mdc-slider__thumb, .mat-mdc-slider._mat-animation-noopable.mdc-slider--discrete .mdc-slider__track--active_fill,
.mat-mdc-slider._mat-animation-noopable .mdc-slider__value-indicator {
  transition: none;
}
.mat-mdc-slider .mat-focus-indicator::before {
  border-radius: 50%;
}

.mdc-slider__thumb--focused .mat-focus-indicator::before {
  content: "";
}
`],encapsulation:2})})()}return e})();var un={provide:qr,useExisting:li(()=>Ct),multi:!0};var Ct=(()=>{class e{_ngZone=p(Ke$1);_elementRef=p(ke);_cdr=p(ut);_slider=p(wi);_platform=p(pn);_listenerCleanups;get value(){return ir(this._hostElement.value,0)}set value(t){t===null&&(t=this._getDefaultValue()),t=isNaN(t)?0:t;let i=t+``;if(!this._hasSetInitialValue){this._initialValue=i;return}this._isActive||this._setValue(i)}_setValue(t){this._hostElement.value=t,this._updateThumbUIByValue(),this._slider._onValueChange(this),this._cdr.detectChanges(),this._slider._cdr.markForCheck()}valueChange=new fe;dragStart=new fe;dragEnd=new fe;get translateX(){return this._slider.min>=this._slider.max?(this._translateX=this._tickMarkOffset,this._translateX):(this._translateX===void 0&&(this._translateX=this._calcTranslateXByValue()),this._translateX)}set translateX(t){this._translateX=t}_translateX;thumbPosition=y.END;get min(){return ir(this._hostElement.min,0)}set min(t){this._hostElement.min=t+``,this._cdr.detectChanges()}get max(){return ir(this._hostElement.max,0)}set max(t){this._hostElement.max=t+``,this._cdr.detectChanges()}get step(){return ir(this._hostElement.step,0)}set step(t){this._hostElement.step=t+``,this._cdr.detectChanges()}get disabled(){return ye(this._hostElement.disabled)}set disabled(t){this._hostElement.disabled=t,this._cdr.detectChanges(),this._slider.disabled!==this.disabled&&(this._slider.disabled=this.disabled)}get percentage(){return this._slider.min>=this._slider.max?this._slider._isRtl()?1:0:(this.value-this._slider.min)/(this._slider.max-this._slider.min)}get fillPercentage(){return this._slider._cachedWidth?this._translateX===0?0:this.translateX/this._slider._cachedWidth:this._slider._isRtl()?1:0}_hostElement=this._elementRef.nativeElement;_valuetext=me(``);_knobRadius=8;_tickMarkOffset=3;_isActive=!1;_isFocused=!1;_setIsFocused(t){this._isFocused=t}_hasSetInitialValue=!1;_initialValue;_formControl;_destroyed=new U;_skipUIUpdate=!1;_onChangeFn;_onTouchedFn=()=>{};_isControlInitialized=!1;constructor(){let t=p(Xt);this._ngZone.runOutsideAngular(()=>{this._listenerCleanups=[t.listen(this._hostElement,`pointerdown`,this._onPointerDown.bind(this)),t.listen(this._hostElement,`pointermove`,this._onPointerMove.bind(this)),t.listen(this._hostElement,`pointerup`,this._onPointerUp.bind(this))]})}ngOnDestroy(){this._listenerCleanups.forEach(t=>t()),this._destroyed.next(),this._destroyed.complete(),this.dragStart.complete(),this.dragEnd.complete()}initProps(){this._updateWidthInactive(),this.disabled!==this._slider.disabled&&(this._slider.disabled=!0),this.step=this._slider.step,this.min=this._slider.min,this.max=this._slider.max,this._initValue()}initUI(){this._updateThumbUIByValue()}_initValue(){this._hasSetInitialValue=!0,this._initialValue===void 0?this.value=this._getDefaultValue():(this._hostElement.value=this._initialValue,this._updateThumbUIByValue(),this._slider._onValueChange(this),this._cdr.detectChanges())}_getDefaultValue(){return this.min}_onBlur(){this._setIsFocused(!1),this._onTouchedFn()}_onFocus(){this._slider._setTransition(!1),this._slider._updateTrackUI(this),this._setIsFocused(!0)}_onChange(){this.valueChange.emit(this.value),this._isActive&&this._updateThumbUIByValue({withAnimation:!0})}_onInput(){this._onChangeFn?.(this.value),(this._slider.step||!this._isActive)&&this._updateThumbUIByValue({withAnimation:!this._isActive}),this._slider._onValueChange(this)}_onNgControlValueChange(){(!this._isActive||!this._isFocused)&&(this._slider._onValueChange(this),this._updateThumbUIByValue()),this._slider.disabled=this._formControl.disabled}_onPointerDown(t){if(!(this.disabled||t.button!==0)){if(this._platform.IOS){let i=this._slider._isCursorOnSliderThumb(t,this._slider._getThumb(this.thumbPosition)._hostElement.getBoundingClientRect());this._isActive=i,this._updateWidthActive(),this._slider._updateDimensions();return}this._isActive=!0,this._setIsFocused(!0),this._updateWidthActive(),this._slider._updateDimensions(),this._slider.step||this._updateThumbUIByPointerEvent(t,{withAnimation:!0}),this.disabled||(this._handleValueCorrection(t),this.dragStart.emit({source:this,parent:this._slider,value:this.value}))}}_handleValueCorrection(t){this._skipUIUpdate=!0,setTimeout(()=>{this._skipUIUpdate=!1,this._fixValue(t)},0)}_fixValue(t){let i=t.clientX-this._slider._cachedLeft,n=this._slider._cachedWidth,a=this._slider.step===0?1:this._slider.step,c=Math.floor((this._slider.max-this._slider.min)/a),d=this._slider._isRtl()?1-i/n:i/n,S=Math.round(d*c)/c*(this._slider.max-this._slider.min)+this._slider.min,w=Math.round(S/a)*a;if(w===this.value){this._slider._onValueChange(this),this._slider.step>0?this._updateThumbUIByValue():this._updateThumbUIByPointerEvent(t,{withAnimation:this._slider._hasAnimation});return}this.value=w,this.valueChange.emit(this.value),this._onChangeFn?.(this.value),this._slider._onValueChange(this),this._slider.step>0?this._updateThumbUIByValue():this._updateThumbUIByPointerEvent(t,{withAnimation:this._slider._hasAnimation})}_onPointerMove(t){!this._slider.step&&this._isActive&&this._updateThumbUIByPointerEvent(t)}_onPointerUp(){this._isActive&&(this._isActive=!1,this._platform.SAFARI&&this._setIsFocused(!1),this.dragEnd.emit({source:this,parent:this._slider,value:this.value}),setTimeout(()=>this._updateWidthInactive(),this._platform.IOS?10:0))}_clamp(t){let i=this._tickMarkOffset,n=this._slider._cachedWidth-this._tickMarkOffset;return Math.max(Math.min(t,n),i)}_calcTranslateXByValue(){return this._slider._isRtl()?(1-this.percentage)*(this._slider._cachedWidth-this._tickMarkOffset*2)+this._tickMarkOffset:this.percentage*(this._slider._cachedWidth-this._tickMarkOffset*2)+this._tickMarkOffset}_calcTranslateXByPointerEvent(t){return t.clientX-this._slider._cachedLeft}_updateWidthActive(){}_updateWidthInactive(){this._hostElement.style.padding=`0 ${this._slider._inputPadding}px`,this._hostElement.style.width=`calc(100% + ${this._slider._inputPadding-this._tickMarkOffset*2}px)`,this._hostElement.style.left=`-${this._slider._rippleRadius-this._tickMarkOffset}px`}_updateThumbUIByValue(t){this.translateX=this._clamp(this._calcTranslateXByValue()),this._updateThumbUI(t)}_updateThumbUIByPointerEvent(t,i){this.translateX=this._clamp(this._calcTranslateXByPointerEvent(t)),this._updateThumbUI(i)}_updateThumbUI(t){this._slider._setTransition(!!t?.withAnimation),this._slider._onTranslateXChange(this)}writeValue(t){(this._isControlInitialized||t!==null)&&(this.value=t)}registerOnChange(t){this._onChangeFn=t,this._isControlInitialized=!0}registerOnTouched(t){this._onTouchedFn=t}setDisabledState(t){this.disabled=t}focus(){this._hostElement.focus()}blur(){this._hostElement.blur()}static ɵfac=function(i){return new(i||e)};static ɵdir=pe({type:e,selectors:[[`input`,`matSliderThumb`,``]],hostAttrs:[`type`,`range`,1,`mdc-slider__input`],hostVars:1,hostBindings:function(i,n){i&1&&Q(`change`,function(){return n._onChange()})(`input`,function(){return n._onInput()})(`blur`,function(){return n._onBlur()})(`focus`,function(){return n._onFocus()}),i&2&&ae(`aria-valuetext`,n._valuetext())},inputs:{value:[2,`value`,`value`,ir]},outputs:{valueChange:`valueChange`,dragStart:`dragStart`,dragEnd:`dragEnd`},exportAs:[`matSliderThumb`],features:[vt([un,{provide:Qe,useExisting:e}])]})}return e})();var Ye=(()=>{class e{static ɵfac=function(i){return new(i||e)};static ɵmod=Pe({type:e});static ɵinj=Re({imports:[Es,Ht]})}return e})();function vn(e,o){if(e&1&&(E(0,`div`,4),H(1),T()),e&2){let t=F();x(),Xe(` 0% - `,t.viewValue(),`% `)}}var ki=0;var xn=0;var yn=100;var Ze=100;var wn=15;var kn=75;var Cn=100;var Si=(()=>{class e{tooltip=ce(``);value=ce();valueChange=Wt();menuTrigger=_i(qx);slider=_i(Ct);viewValue=me(ki);isConfidenceSet=me(!1);hideLowerLimitLabel=me(!0);hideUpperLimitLabel=me(!1);constructor(){At(()=>{let t=this.value();t!=null&&t!==void 0&&this._setViewValue(t)}),At(t=>{let i=this.menuTrigger();if(!i)return;let n=i.menuOpened.pipe(Q0(Cn)).subscribe(()=>{this.slider()?.focus(),this.toggleLimits(this.viewValue())});t(()=>n.unsubscribe())})}formatLabel(t){return t+`%`}toggleLimits(t){this.hideLowerLimitLabel.set(t<wn),this.hideUpperLimitLabel.set(t>kn)}sliderValueChanged(t){this.isConfidenceSet.set(!0),this.viewValue.set(Math.round(t)),this.valueChange.emit(t/Ze)}resetConfidence(){this.viewValue.set(ki),this.toggleLimits(ki),this.isConfidenceSet.set(!1),this.valueChange.emit(void 0),this.menuTrigger()?.closeMenu()}_setViewValue(t){let i=Math.min(yn,Math.max(xn,t*Ze));this.isConfidenceSet.set(!0),this.viewValue.set(Math.round(i))}static ɵfac=function(i){return new(i||e)};static ɵcmp=te({type:e,selectors:[[`ui-threshold-picker`]],viewQuery:function(i,n){i&1&&tr(n.menuTrigger,qx,5)(n.slider,Ct,5),i&2&&nr(2)},inputs:{tooltip:[1,`tooltip`],value:[1,`value`]},outputs:{valueChange:`valueChange`},decls:22,vars:14,consts:[[`menuTrigger`,`matMenuTrigger`],[`menu`,`matMenu`],[`ngSliderThumb`,`matSliderThumb`],[1,`ui-threshold-picker-container`],[`automation-id`,`threshold-picker-value`,`data-testid`,`threshold-picker-value`,1,`ui-threshold-picker-value`],[`automation-id`,`threshold-picker-button`,`data-testid`,`threshold-picker-button`,`mat-icon-button`,``,`color`,`primary`,1,`filter-button`,3,`matMenuTriggerFor`,`matTooltip`],[`xPosition`,`before`],[1,`ui-threshold-picker-slider-container`,3,`click`,`keydown`],[1,`limits-container`],[1,`limits`,3,`ngClass`],[1,`slider-container`],[`thumbLabel`,``,`discrete`,``,3,`keydown.enter`,`displayWith`],[`matSliderThumb`,``,`data-testid`,`threshold-picker-input`,3,`input`,`change`,`value`],[`color`,`primary`,`mat-button`,``,`data-testid`,`reset-confidence`,1,`btn-small`,3,`click`,`disabled`]],template:function(i,n){if(i&1){let a=nt();E(0,`div`,3),ne(1,vn,2,1,`div`,4),E(2,`button`,5,0),B(4,`translate`),E(5,`mat-icon`),H(6,`filter_list`),T()(),E(7,`mat-menu`,6,1)(9,`div`,7),Q(`click`,function(d){return d.stopPropagation()})(`keydown`,function(d){return d.stopPropagation()}),E(10,`div`,8)(11,`span`,9),H(12,`0%`),T(),E(13,`span`,9),H(14,`100%`),T()(),E(15,`div`,10)(16,`mat-slider`,11),Q(`keydown.enter`,function(d){return Ce(a),Tn$1(3).closeMenu(),Se(d.preventDefault())}),E(17,`input`,12,2),Q(`input`,function(){Ce(a);let d=Tn$1(18);return Se(n.toggleLimits(d.value))})(`change`,function(){Ce(a);let d=Tn$1(18);return Se(n.sliderValueChanged(d.value))}),T()()(),E(19,`button`,13),Q(`click`,function(){return n.resetConfidence()}),H(20),B(21,`translate`),T()()()()}if(i&2){let a=Tn$1(8);x(),ie(n.isConfidenceSet()?1:-1),x(),K(`matMenuTriggerFor`,a)(`matTooltip`,n.tooltip()),ae(`aria-label`,$(4,10,`A11Y_THRESHOLD_PICKER_FILTER_BUTTON`)),x(9),K(`ngClass`,n.hideLowerLimitLabel()?`transparent`:`opaque`),x(2),K(`ngClass`,n.hideUpperLimitLabel()?`transparent`:`opaque`),x(3),K(`displayWith`,n.formatLabel),x(),K(`value`,n.viewValue()),x(2),K(`disabled`,!n.isConfidenceSet()),x(),ze($(21,12,`THRESHOLD_PICKER_RESET_CONFIDENCE`))}},dependencies:[Qt,Ye,Ke,Ct,Xx,wu,qx,Ry,Hn$1,ki$1,Zn$1,gr,Ci,$n$1,yn$1,WA,wt],styles:[`.ui-threshold-picker-container[_ngcontent-%COMP%]{font-size:var(--%NS%apollo-font-s-size);display:flex}.ui-threshold-picker-container[_ngcontent-%COMP%]   .ui-threshold-picker-value[_ngcontent-%COMP%]{margin:auto}.ui-threshold-picker-container[_ngcontent-%COMP%]   .filter-button[_ngcontent-%COMP%]{margin-right:10px;margin-left:5px}.ui-threshold-picker-slider-container[_ngcontent-%COMP%]{padding:var(--%NS%apollo-pad-xxl) var(--%NS%apollo-pad-xxxl) 5px}.ui-threshold-picker-slider-container[_ngcontent-%COMP%]   .limits-container[_ngcontent-%COMP%]{display:flex;justify-content:space-between}.ui-threshold-picker-slider-container[_ngcontent-%COMP%]   .limits-container[_ngcontent-%COMP%]   .limits[_ngcontent-%COMP%]{font-family:var(--%NS%apollo-font-normal);font-size:var(--%NS%apollo-font-m-size);font-weight:400;transition:opacity .2s ease-in-out}.ui-threshold-picker-slider-container[_ngcontent-%COMP%]   .limits-container[_ngcontent-%COMP%]   .limits.opaque[_ngcontent-%COMP%]{opacity:1}.ui-threshold-picker-slider-container[_ngcontent-%COMP%]   .limits-container[_ngcontent-%COMP%]   .limits.transparent[_ngcontent-%COMP%]{opacity:0}`]})}return e})();var Sn=new ee(`ListOption`);var Mi=(()=>{class e{_elementRef=p(ke);static ɵfac=function(i){return new(i||e)};static ɵdir=pe({type:e,selectors:[[``,`matListItemTitle`,``]],hostAttrs:[1,`mat-mdc-list-item-title`,`mdc-list-item__primary-text`]})}return e})();var Tn=(()=>{class e{_elementRef=p(ke);static ɵfac=function(i){return new(i||e)};static ɵdir=pe({type:e,selectors:[[``,`matListItemLine`,``]],hostAttrs:[1,`mat-mdc-list-item-line`,`mdc-list-item__secondary-text`]})}return e})();var Ni=(()=>{class e{static ɵfac=function(i){return new(i||e)};static ɵdir=pe({type:e,selectors:[[``,`matListItemMeta`,``]],hostAttrs:[1,`mat-mdc-list-item-meta`,`mdc-list-item__end`]})}return e})();var Je=(()=>{class e{_listOption=p(Sn,{optional:!0});_isAlignedAtStart(){return!this._listOption||this._listOption?._getTogglePosition()===`after`}static ɵfac=function(i){return new(i||e)};static ɵdir=pe({type:e,hostVars:4,hostBindings:function(i,n){i&2&&ge(`mdc-list-item__start`,n._isAlignedAtStart())(`mdc-list-item__end`,!n._isAlignedAtStart())}})}return e})();var Mn=(()=>{class e extends Je{static ɵfac=(()=>{let t;return function(n){return(t||(t=Ot(e)))(n||e)}})();static ɵdir=pe({type:e,selectors:[[``,`matListItemAvatar`,``]],hostAttrs:[1,`mat-mdc-list-item-avatar`],features:[kt$1]})}return e})();var Ii=(()=>{class e extends Je{static ɵfac=(()=>{let t;return function(n){return(t||(t=Ot(e)))(n||e)}})();static ɵdir=pe({type:e,selectors:[[``,`matListItemIcon`,``]],hostAttrs:[1,`mat-mdc-list-item-icon`],features:[kt$1]})}return e})();var Nn=new ee(`MAT_LIST_CONFIG`);var Ti=(()=>{class e{_isNonInteractive=!0;get disableRipple(){return this._disableRipple}set disableRipple(t){this._disableRipple=xr(t)}_disableRipple=!1;get disabled(){return this._disabled()}set disabled(t){this._disabled.set(xr(t))}_disabled=me(!1);_defaultOptions=p(Nn,{optional:!0});static ɵfac=function(i){return new(i||e)};static ɵdir=pe({type:e,hostVars:1,hostBindings:function(i,n){i&2&&ae(`aria-disabled`,n.disabled)},inputs:{disableRipple:`disableRipple`,disabled:`disabled`}})}return e})();var In=(()=>{class e{_elementRef=p(ke);_ngZone=p(Ke$1);_listBase=p(Ti,{optional:!0});_platform=p(pn);_hostElement;_isButtonElement;_noopAnimations=fn();_avatars;_icons;set lines(t){this._explicitLines=Lr(t,null),this._updateItemLines(!1)}_explicitLines=null;get disableRipple(){return this.disabled||this._disableRipple||this._noopAnimations||!!this._listBase?.disableRipple}set disableRipple(t){this._disableRipple=xr(t)}_disableRipple=!1;get disabled(){return this._disabled()||!!this._listBase?.disabled}set disabled(t){this._disabled.set(xr(t))}_disabled=me(!1);_subscriptions=new Vt;_rippleRenderer=null;_hasUnscopedTextContent=!1;rippleConfig;get rippleDisabled(){return this.disableRipple||!!this.rippleConfig.disabled}constructor(){p(Dn$1).load(Br);let t=p(Rf,{optional:!0});this.rippleConfig=t||{},this._hostElement=this._elementRef.nativeElement,this._isButtonElement=this._hostElement.nodeName.toLowerCase()===`button`,this._listBase&&!this._listBase._isNonInteractive&&this._initInteractiveListItem(),this._isButtonElement&&!this._hostElement.hasAttribute(`type`)&&this._hostElement.setAttribute(`type`,`button`)}ngAfterViewInit(){this._monitorProjectedLinesAndTitle(),this._updateItemLines(!0)}ngOnDestroy(){this._subscriptions.unsubscribe(),this._rippleRenderer!==null&&this._rippleRenderer._removeTriggerEvents()}_hasIconOrAvatar(){return!!(this._avatars.length||this._icons.length)}_initInteractiveListItem(){this._hostElement.classList.add(`mat-mdc-list-item-interactive`),this._rippleRenderer=new Of(this,this._ngZone,this._hostElement,this._platform,p(Ue)),this._rippleRenderer.setupTriggerEvents(this._hostElement)}_monitorProjectedLinesAndTitle(){this._ngZone.runOutsideAngular(()=>{this._subscriptions.add(mt(this._lines.changes,this._titles.changes).subscribe(()=>this._updateItemLines(!1)))})}_updateItemLines(t){if(!this._lines||!this._titles||!this._unscopedContent)return;t&&this._checkDomForUnscopedTextContent();let i=this._explicitLines??this._inferLinesFromContent(),n=this._unscopedContent.nativeElement;if(this._hostElement.classList.toggle(`mat-mdc-list-item-single-line`,i<=1),this._hostElement.classList.toggle(`mdc-list-item--with-one-line`,i<=1),this._hostElement.classList.toggle(`mdc-list-item--with-two-lines`,i===2),this._hostElement.classList.toggle(`mdc-list-item--with-three-lines`,i===3),this._hasUnscopedTextContent){let a=this._titles.length===0&&i===1;n.classList.toggle(`mdc-list-item__primary-text`,a),n.classList.toggle(`mdc-list-item__secondary-text`,!a)}else n.classList.remove(`mdc-list-item__primary-text`),n.classList.remove(`mdc-list-item__secondary-text`)}_inferLinesFromContent(){let t=this._titles.length+this._lines.length;return this._hasUnscopedTextContent&&(t+=1),t}_checkDomForUnscopedTextContent(){this._hasUnscopedTextContent=Array.from(this._unscopedContent.nativeElement.childNodes).filter(t=>t.nodeType!==t.COMMENT_NODE).some(t=>!!(t.textContent&&t.textContent.trim()))}static ɵfac=function(i){return new(i||e)};static ɵdir=pe({type:e,contentQueries:function(i,n,a){if(i&1&&Vi$1(a,Mn,4)(a,Ii,4),i&2){let c;$e(c=Ge())&&(n._avatars=c),$e(c=Ge())&&(n._icons=c)}},hostVars:4,hostBindings:function(i,n){i&2&&(ae(`aria-disabled`,n.disabled)(`disabled`,n._isButtonElement&&n.disabled||null),ge(`mdc-list-item--disabled`,n.disabled))},inputs:{lines:`lines`,disableRipple:`disableRipple`,disabled:`disabled`}})}return e})();var tn=(()=>{class e extends Ti{static ɵfac=(()=>{let t;return function(n){return(t||(t=Ot(e)))(n||e)}})();static ɵcmp=(function(){return te({type:e,selectors:[[`mat-list`]],hostAttrs:[1,`mat-mdc-list`,`mat-mdc-list-base`,`mdc-list`],exportAs:[`matList`],features:[vt([{provide:Ti,useExisting:e}]),kt$1],ngContentSelectors:[`*`],decls:1,vars:0,template:function(n,a){n&1&&(Pt(),Ye$1(0))},styles:[`.mdc-list {
  margin: 0;
  padding: 8px 0;
  list-style-type: none;
}
.mdc-list:focus {
  outline: none;
}

.mdc-list-item {
  display: flex;
  position: relative;
  justify-content: flex-start;
  overflow: hidden;
  padding: 0;
  align-items: stretch;
  cursor: pointer;
  padding-left: 16px;
  padding-right: 16px;
  background-color: var(--%NS%mat-list-list-item-container-color, transparent);
  border-radius: var(--%NS%mat-list-list-item-container-shape, var(--%NS%mat-sys-corner-none));
}
.mdc-list-item.mdc-list-item--selected {
  background-color: var(--%NS%mat-list-list-item-selected-container-color);
}
.mdc-list-item:focus {
  outline: 0;
}
.mdc-list-item.mdc-list-item--disabled {
  cursor: auto;
}
.mdc-list-item.mdc-list-item--with-one-line {
  height: var(--%NS%mat-list-list-item-one-line-container-height, 48px);
}
.mdc-list-item.mdc-list-item--with-one-line .mdc-list-item__start {
  align-self: center;
  margin-top: 0;
}
.mdc-list-item.mdc-list-item--with-one-line .mdc-list-item__end {
  align-self: center;
  margin-top: 0;
}
.mdc-list-item.mdc-list-item--with-two-lines {
  height: var(--%NS%mat-list-list-item-two-line-container-height, 64px);
}
.mdc-list-item.mdc-list-item--with-two-lines .mdc-list-item__start {
  align-self: flex-start;
  margin-top: 16px;
}
.mdc-list-item.mdc-list-item--with-two-lines .mdc-list-item__end {
  align-self: center;
  margin-top: 0;
}
.mdc-list-item.mdc-list-item--with-three-lines {
  height: var(--%NS%mat-list-list-item-three-line-container-height, 88px);
}
.mdc-list-item.mdc-list-item--with-three-lines .mdc-list-item__start {
  align-self: flex-start;
  margin-top: 16px;
}
.mdc-list-item.mdc-list-item--with-three-lines .mdc-list-item__end {
  align-self: flex-start;
  margin-top: 16px;
}
.mdc-list-item.mdc-list-item--%NS%selected::before, .mdc-list-item.mdc-list-item--%NS%selected:focus::before, .mdc-list-item:not(.mdc-list-item--selected):focus::before {
  position: absolute;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  content: "";
  pointer-events: none;
}

a.mdc-list-item {
  color: inherit;
  text-decoration: none;
}

.mdc-list-item__start {
  fill: currentColor;
  flex-shrink: 0;
  pointer-events: none;
}
.mdc-list-item--with-leading-icon .mdc-list-item__start {
  color: var(--%NS%mat-list-list-item-leading-icon-color, var(--%NS%mat-sys-on-surface-variant));
  width: var(--%NS%mat-list-list-item-leading-icon-size, 24px);
  height: var(--%NS%mat-list-list-item-leading-icon-size, 24px);
  margin-left: 16px;
  margin-right: 32px;
}
[dir=rtl] .mdc-list-item--with-leading-icon .mdc-list-item__start {
  margin-left: 32px;
  margin-right: 16px;
}
.mdc-list-item--%NS%with-leading-icon:hover .mdc-list-item__start {
  color: var(--%NS%mat-list-list-item-hover-leading-icon-color);
}
.mdc-list-item--with-leading-avatar .mdc-list-item__start {
  width: var(--%NS%mat-list-list-item-leading-avatar-size, 40px);
  height: var(--%NS%mat-list-list-item-leading-avatar-size, 40px);
  margin-left: 16px;
  margin-right: 16px;
  border-radius: 50%;
}
.mdc-list-item--with-leading-avatar .mdc-list-item__start, [dir=rtl] .mdc-list-item--with-leading-avatar .mdc-list-item__start {
  margin-left: 16px;
  margin-right: 16px;
  border-radius: 50%;
}

.mdc-list-item__end {
  flex-shrink: 0;
  pointer-events: none;
}
.mdc-list-item--with-trailing-meta .mdc-list-item__end {
  font-family: var(--%NS%mat-list-list-item-trailing-supporting-text-font, var(--%NS%mat-sys-label-small-font));
  line-height: var(--%NS%mat-list-list-item-trailing-supporting-text-line-height, var(--%NS%mat-sys-label-small-line-height));
  font-size: var(--%NS%mat-list-list-item-trailing-supporting-text-size, var(--%NS%mat-sys-label-small-size));
  font-weight: var(--%NS%mat-list-list-item-trailing-supporting-text-weight, var(--%NS%mat-sys-label-small-weight));
  letter-spacing: var(--%NS%mat-list-list-item-trailing-supporting-text-tracking, var(--%NS%mat-sys-label-small-tracking));
}
.mdc-list-item--with-trailing-icon .mdc-list-item__end {
  color: var(--%NS%mat-list-list-item-trailing-icon-color, var(--%NS%mat-sys-on-surface-variant));
  width: var(--%NS%mat-list-list-item-trailing-icon-size, 24px);
  height: var(--%NS%mat-list-list-item-trailing-icon-size, 24px);
}
.mdc-list-item--%NS%with-trailing-icon:hover .mdc-list-item__end {
  color: var(--%NS%mat-list-list-item-hover-trailing-icon-color);
}
.mdc-list-item.mdc-list-item--with-trailing-meta .mdc-list-item__end {
  color: var(--%NS%mat-list-list-item-trailing-supporting-text-color, var(--%NS%mat-sys-on-surface-variant));
}
.mdc-list-item--selected.mdc-list-item--with-trailing-icon .mdc-list-item__end {
  color: var(--%NS%mat-list-list-item-selected-trailing-icon-color, var(--%NS%mat-sys-primary));
}

.mdc-list-item__content {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  align-self: center;
  flex: 1;
  pointer-events: none;
}
.mdc-list-item--with-two-lines .mdc-list-item__content, .mdc-list-item--with-three-lines .mdc-list-item__content {
  align-self: stretch;
}

.mdc-list-item__primary-text {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  color: var(--%NS%mat-list-list-item-label-text-color, var(--%NS%mat-sys-on-surface));
  font-family: var(--%NS%mat-list-list-item-label-text-font, var(--%NS%mat-sys-body-large-font));
  line-height: var(--%NS%mat-list-list-item-label-text-line-height, var(--%NS%mat-sys-body-large-line-height));
  font-size: var(--%NS%mat-list-list-item-label-text-size, var(--%NS%mat-sys-body-large-size));
  font-weight: var(--%NS%mat-list-list-item-label-text-weight, var(--%NS%mat-sys-body-large-weight));
  letter-spacing: var(--%NS%mat-list-list-item-label-text-tracking, var(--%NS%mat-sys-body-large-tracking));
}
.mdc-list-item:hover .mdc-list-item__primary-text {
  color: var(--%NS%mat-list-list-item-hover-label-text-color, var(--%NS%mat-sys-on-surface));
}
.mdc-list-item:focus .mdc-list-item__primary-text {
  color: var(--%NS%mat-list-list-item-focus-label-text-color, var(--%NS%mat-sys-on-surface));
}
.mdc-list-item--with-two-lines .mdc-list-item__primary-text, .mdc-list-item--with-three-lines .mdc-list-item__primary-text {
  display: block;
  margin-top: 0;
  line-height: normal;
  margin-bottom: -20px;
}
.mdc-list-item--with-two-lines .mdc-list-item__primary-text::before, .mdc-list-item--with-three-lines .mdc-list-item__primary-text::before {
  display: inline-block;
  width: 0;
  height: 28px;
  content: "";
  vertical-align: 0;
}
.mdc-list-item--with-two-lines .mdc-list-item__primary-text::after, .mdc-list-item--with-three-lines .mdc-list-item__primary-text::after {
  display: inline-block;
  width: 0;
  height: 20px;
  content: "";
  vertical-align: -20px;
}

.mdc-list-item__secondary-text {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  display: block;
  margin-top: 0;
  color: var(--%NS%mat-list-list-item-supporting-text-color, var(--%NS%mat-sys-on-surface-variant));
  font-family: var(--%NS%mat-list-list-item-supporting-text-font, var(--%NS%mat-sys-body-medium-font));
  line-height: var(--%NS%mat-list-list-item-supporting-text-line-height, var(--%NS%mat-sys-body-medium-line-height));
  font-size: var(--%NS%mat-list-list-item-supporting-text-size, var(--%NS%mat-sys-body-medium-size));
  font-weight: var(--%NS%mat-list-list-item-supporting-text-weight, var(--%NS%mat-sys-body-medium-weight));
  letter-spacing: var(--%NS%mat-list-list-item-supporting-text-tracking, var(--%NS%mat-sys-body-medium-tracking));
}
.mdc-list-item__secondary-text::before {
  display: inline-block;
  width: 0;
  height: 20px;
  content: "";
  vertical-align: 0;
}
.mdc-list-item--with-three-lines .mdc-list-item__secondary-text {
  white-space: normal;
  line-height: 20px;
}
.mdc-list-item--with-overline .mdc-list-item__secondary-text {
  white-space: nowrap;
  line-height: auto;
}

.mdc-list-item--with-leading-radio.mdc-list-item,
.mdc-list-item--with-leading-checkbox.mdc-list-item,
.mdc-list-item--with-leading-icon.mdc-list-item,
.mdc-list-item--with-leading-avatar.mdc-list-item {
  padding-left: 0;
  padding-right: 16px;
}
[dir=rtl] .mdc-list-item--with-leading-radio.mdc-list-item,
[dir=rtl] .mdc-list-item--with-leading-checkbox.mdc-list-item,
[dir=rtl] .mdc-list-item--with-leading-icon.mdc-list-item,
[dir=rtl] .mdc-list-item--with-leading-avatar.mdc-list-item {
  padding-left: 16px;
  padding-right: 0;
}
.mdc-list-item--with-leading-radio.mdc-list-item--with-two-lines .mdc-list-item__primary-text,
.mdc-list-item--with-leading-checkbox.mdc-list-item--with-two-lines .mdc-list-item__primary-text,
.mdc-list-item--with-leading-icon.mdc-list-item--with-two-lines .mdc-list-item__primary-text,
.mdc-list-item--with-leading-avatar.mdc-list-item--with-two-lines .mdc-list-item__primary-text {
  display: block;
  margin-top: 0;
  line-height: normal;
  margin-bottom: -20px;
}
.mdc-list-item--with-leading-radio.mdc-list-item--with-two-lines .mdc-list-item__primary-text::before,
.mdc-list-item--with-leading-checkbox.mdc-list-item--with-two-lines .mdc-list-item__primary-text::before,
.mdc-list-item--with-leading-icon.mdc-list-item--with-two-lines .mdc-list-item__primary-text::before,
.mdc-list-item--with-leading-avatar.mdc-list-item--with-two-lines .mdc-list-item__primary-text::before {
  display: inline-block;
  width: 0;
  height: 32px;
  content: "";
  vertical-align: 0;
}
.mdc-list-item--with-leading-radio.mdc-list-item--with-two-lines .mdc-list-item__primary-text::after,
.mdc-list-item--with-leading-checkbox.mdc-list-item--with-two-lines .mdc-list-item__primary-text::after,
.mdc-list-item--with-leading-icon.mdc-list-item--with-two-lines .mdc-list-item__primary-text::after,
.mdc-list-item--with-leading-avatar.mdc-list-item--with-two-lines .mdc-list-item__primary-text::after {
  display: inline-block;
  width: 0;
  height: 20px;
  content: "";
  vertical-align: -20px;
}
.mdc-list-item--with-leading-radio.mdc-list-item--with-two-lines.mdc-list-item--with-trailing-meta .mdc-list-item__end,
.mdc-list-item--with-leading-checkbox.mdc-list-item--with-two-lines.mdc-list-item--with-trailing-meta .mdc-list-item__end,
.mdc-list-item--with-leading-icon.mdc-list-item--with-two-lines.mdc-list-item--with-trailing-meta .mdc-list-item__end,
.mdc-list-item--with-leading-avatar.mdc-list-item--with-two-lines.mdc-list-item--with-trailing-meta .mdc-list-item__end {
  display: block;
  margin-top: 0;
  line-height: normal;
}
.mdc-list-item--with-leading-radio.mdc-list-item--with-two-lines.mdc-list-item--with-trailing-meta .mdc-list-item__end::before,
.mdc-list-item--with-leading-checkbox.mdc-list-item--with-two-lines.mdc-list-item--with-trailing-meta .mdc-list-item__end::before,
.mdc-list-item--with-leading-icon.mdc-list-item--with-two-lines.mdc-list-item--with-trailing-meta .mdc-list-item__end::before,
.mdc-list-item--with-leading-avatar.mdc-list-item--with-two-lines.mdc-list-item--with-trailing-meta .mdc-list-item__end::before {
  display: inline-block;
  width: 0;
  height: 32px;
  content: "";
  vertical-align: 0;
}

.mdc-list-item--with-trailing-icon.mdc-list-item, [dir=rtl] .mdc-list-item--with-trailing-icon.mdc-list-item {
  padding-left: 0;
  padding-right: 0;
}
.mdc-list-item--with-trailing-icon .mdc-list-item__end {
  margin-left: 16px;
  margin-right: 16px;
}

.mdc-list-item--with-trailing-meta.mdc-list-item {
  padding-left: 16px;
  padding-right: 0;
}
[dir=rtl] .mdc-list-item--with-trailing-meta.mdc-list-item {
  padding-left: 0;
  padding-right: 16px;
}
.mdc-list-item--with-trailing-meta .mdc-list-item__end {
  -webkit-user-select: none;
  user-select: none;
  margin-left: 28px;
  margin-right: 16px;
}
[dir=rtl] .mdc-list-item--with-trailing-meta .mdc-list-item__end {
  margin-left: 16px;
  margin-right: 28px;
}
.mdc-list-item--with-trailing-meta.mdc-list-item--with-three-lines .mdc-list-item__end, .mdc-list-item--with-trailing-meta.mdc-list-item--with-two-lines .mdc-list-item__end {
  display: block;
  line-height: normal;
  align-self: flex-start;
  margin-top: 0;
}
.mdc-list-item--with-trailing-meta.mdc-list-item--with-three-lines .mdc-list-item__end::before, .mdc-list-item--with-trailing-meta.mdc-list-item--with-two-lines .mdc-list-item__end::before {
  display: inline-block;
  width: 0;
  height: 28px;
  content: "";
  vertical-align: 0;
}

.mdc-list-item--with-leading-radio .mdc-list-item__start,
.mdc-list-item--with-leading-checkbox .mdc-list-item__start {
  margin-left: 8px;
  margin-right: 24px;
}
[dir=rtl] .mdc-list-item--with-leading-radio .mdc-list-item__start,
[dir=rtl] .mdc-list-item--with-leading-checkbox .mdc-list-item__start {
  margin-left: 24px;
  margin-right: 8px;
}
.mdc-list-item--with-leading-radio.mdc-list-item--with-two-lines .mdc-list-item__start,
.mdc-list-item--with-leading-checkbox.mdc-list-item--with-two-lines .mdc-list-item__start {
  align-self: flex-start;
  margin-top: 8px;
}

.mdc-list-item--with-trailing-radio.mdc-list-item,
.mdc-list-item--with-trailing-checkbox.mdc-list-item {
  padding-left: 16px;
  padding-right: 0;
}
[dir=rtl] .mdc-list-item--with-trailing-radio.mdc-list-item,
[dir=rtl] .mdc-list-item--with-trailing-checkbox.mdc-list-item {
  padding-left: 0;
  padding-right: 16px;
}
.mdc-list-item--with-trailing-radio.mdc-list-item--with-leading-icon, .mdc-list-item--with-trailing-radio.mdc-list-item--with-leading-avatar,
.mdc-list-item--with-trailing-checkbox.mdc-list-item--with-leading-icon,
.mdc-list-item--with-trailing-checkbox.mdc-list-item--with-leading-avatar {
  padding-left: 0;
}
[dir=rtl] .mdc-list-item--with-trailing-radio.mdc-list-item--with-leading-icon, [dir=rtl] .mdc-list-item--with-trailing-radio.mdc-list-item--with-leading-avatar,
[dir=rtl] .mdc-list-item--with-trailing-checkbox.mdc-list-item--with-leading-icon,
[dir=rtl] .mdc-list-item--with-trailing-checkbox.mdc-list-item--with-leading-avatar {
  padding-right: 0;
}
.mdc-list-item--with-trailing-radio .mdc-list-item__end,
.mdc-list-item--with-trailing-checkbox .mdc-list-item__end {
  margin-left: 24px;
  margin-right: 8px;
}
[dir=rtl] .mdc-list-item--with-trailing-radio .mdc-list-item__end,
[dir=rtl] .mdc-list-item--with-trailing-checkbox .mdc-list-item__end {
  margin-left: 8px;
  margin-right: 24px;
}
.mdc-list-item--with-trailing-radio.mdc-list-item--with-three-lines .mdc-list-item__end,
.mdc-list-item--with-trailing-checkbox.mdc-list-item--with-three-lines .mdc-list-item__end {
  align-self: flex-start;
  margin-top: 8px;
}

.mdc-list-group__subheader {
  margin: 0.75rem 16px;
}

.mdc-list-item--disabled .mdc-list-item__start,
.mdc-list-item--disabled .mdc-list-item__content,
.mdc-list-item--disabled .mdc-list-item__end {
  opacity: 1;
}
.mdc-list-item--disabled .mdc-list-item__primary-text,
.mdc-list-item--disabled .mdc-list-item__secondary-text {
  opacity: var(--%NS%mat-list-list-item-disabled-label-text-opacity, 0.3);
}
.mdc-list-item--disabled.mdc-list-item--with-leading-icon .mdc-list-item__start {
  color: var(--%NS%mat-list-list-item-disabled-leading-icon-color, var(--%NS%mat-sys-on-surface));
  opacity: var(--%NS%mat-list-list-item-disabled-leading-icon-opacity, 0.38);
}
.mdc-list-item--disabled.mdc-list-item--with-trailing-icon .mdc-list-item__end {
  color: var(--%NS%mat-list-list-item-disabled-trailing-icon-color, var(--%NS%mat-sys-on-surface));
  opacity: var(--%NS%mat-list-list-item-disabled-trailing-icon-opacity, 0.38);
}

.mat-mdc-list-item.mat-mdc-list-item-both-leading-and-trailing, [dir=rtl] .mat-mdc-list-item.mat-mdc-list-item-both-leading-and-trailing {
  padding-left: 0;
  padding-right: 0;
}

.mdc-list-item.mdc-list-item--disabled .mdc-list-item__primary-text {
  color: var(--%NS%mat-list-list-item-disabled-label-text-color, var(--%NS%mat-sys-on-surface));
}

.mdc-list-item:hover::before {
  background-color: var(--%NS%mat-list-list-item-hover-state-layer-color, var(--%NS%mat-sys-on-surface));
  opacity: var(--%NS%mat-list-list-item-hover-state-layer-opacity, var(--%NS%mat-sys-hover-state-layer-opacity));
}

.mdc-list-item.mdc-list-item--%NS%disabled::before {
  background-color: var(--%NS%mat-list-list-item-disabled-state-layer-color, var(--%NS%mat-sys-on-surface));
  opacity: var(--%NS%mat-list-list-item-disabled-state-layer-opacity, var(--%NS%mat-sys-focus-state-layer-opacity));
}

.mdc-list-item:focus::before {
  background-color: var(--%NS%mat-list-list-item-focus-state-layer-color, var(--%NS%mat-sys-on-surface));
  opacity: var(--%NS%mat-list-list-item-focus-state-layer-opacity, var(--%NS%mat-sys-focus-state-layer-opacity));
}

.mdc-list-item--disabled .mdc-radio,
.mdc-list-item--disabled .mdc-checkbox {
  opacity: var(--%NS%mat-list-list-item-disabled-label-text-opacity, 0.3);
}

.mdc-list-item--with-leading-avatar .mat-mdc-list-item-avatar {
  border-radius: var(--%NS%mat-list-list-item-leading-avatar-shape, var(--%NS%mat-sys-corner-full));
  background-color: var(--%NS%mat-list-list-item-leading-avatar-color, var(--%NS%mat-sys-primary-container));
}

.mat-mdc-list-item-icon {
  font-size: var(--%NS%mat-list-list-item-leading-icon-size, 24px);
}

@media (forced-colors: active) {
  a.mdc-list-item--%NS%activated::after {
    content: "";
    position: absolute;
    top: 50%;
    right: 16px;
    transform: translateY(-50%);
    width: 10px;
    height: 0;
    border-bottom: solid 10px;
    border-radius: 10px;
  }
  a.mdc-list-item--activated [dir=rtl]::after {
    right: auto;
    left: 16px;
  }
}

.mat-mdc-list-base {
  display: block;
}
.mat-mdc-list-base .mdc-list-item__start,
.mat-mdc-list-base .mdc-list-item__end,
.mat-mdc-list-base .mdc-list-item__content {
  pointer-events: auto;
}

.mat-mdc-list-item,
.mat-mdc-list-option {
  width: 100%;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}
.mat-mdc-list-item:not(.mat-mdc-list-item-interactive),
.mat-mdc-list-option:not(.mat-mdc-list-item-interactive) {
  cursor: default;
}
.mat-mdc-list-item .mat-divider-inset,
.mat-mdc-list-option .mat-divider-inset {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
}
.mat-mdc-list-item .mat-mdc-list-item-avatar ~ .mat-divider-inset,
.mat-mdc-list-option .mat-mdc-list-item-avatar ~ .mat-divider-inset {
  margin-left: 72px;
}
[dir=rtl] .mat-mdc-list-item .mat-mdc-list-item-avatar ~ .mat-divider-inset,
[dir=rtl] .mat-mdc-list-option .mat-mdc-list-item-avatar ~ .mat-divider-inset {
  margin-right: 72px;
}

.mat-mdc-list-item-interactive::before {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  content: "";
  opacity: 0;
  pointer-events: none;
  border-radius: inherit;
}

.mat-mdc-list-item > .mat-focus-indicator {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  pointer-events: none;
}
.mat-mdc-list-item:focus-visible > .mat-focus-indicator::before {
  content: "";
}

.mat-mdc-list-item.mdc-list-item--with-three-lines .mat-mdc-list-item-line.mdc-list-item__secondary-text {
  white-space: nowrap;
  line-height: normal;
}
.mat-mdc-list-item.mdc-list-item--with-three-lines .mat-mdc-list-item-unscoped-content.mdc-list-item__secondary-text {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

mat-action-list button {
  background: none;
  color: inherit;
  border: none;
  font: inherit;
  outline: inherit;
  -webkit-tap-highlight-color: transparent;
  text-align: start;
}
mat-action-list button::-moz-focus-inner {
  border: 0;
}

.mdc-list-item--with-leading-icon .mdc-list-item__start {
  margin-inline-start: var(--%NS%mat-list-list-item-leading-icon-start-space, 16px);
  margin-inline-end: var(--%NS%mat-list-list-item-leading-icon-end-space, 16px);
}

.mat-mdc-nav-list .mat-mdc-list-item {
  border-radius: var(--%NS%mat-list-active-indicator-shape, var(--%NS%mat-sys-corner-full));
  --%NS%mat-focus-indicator-border-radius: var(--%NS%mat-list-active-indicator-shape, var(--%NS%mat-sys-corner-full));
}
.mat-mdc-nav-list .mat-mdc-list-item.mdc-list-item--activated {
  background-color: var(--%NS%mat-list-active-indicator-color, var(--%NS%mat-sys-secondary-container));
}
`],encapsulation:2})})()}return e})();var en=(()=>{class e extends In{_lines;_titles;_meta;_unscopedContent;_itemText;get activated(){return this._activated}set activated(t){this._activated=xr(t)}_activated=!1;_getAriaCurrent(){return this._hostElement.nodeName===`A`&&this._activated?`page`:null}_hasBothLeadingAndTrailing(){return this._meta.length!==0&&(this._avatars.length!==0||this._icons.length!==0)}static ɵfac=(()=>{let t;return function(n){return(t||(t=Ot(e)))(n||e)}})();static ɵcmp=(function(){let t=[`unscopedContent`],i=[`text`],n=[[[``,`matListItemAvatar`,``],[``,`matListItemIcon`,``]],[[``,`matListItemTitle`,``]],[[``,`matListItemLine`,``]],`*`,[[``,`matListItemMeta`,``]],[[`mat-divider`]]];return te({type:e,selectors:[[`mat-list-item`],[`a`,`mat-list-item`,``],[`button`,`mat-list-item`,``]],contentQueries:function(d,p,S){if(d&1&&Vi$1(S,Tn,5)(S,Mi,5)(S,Ni,5),d&2){let w;$e(w=Ge())&&(p._lines=w),$e(w=Ge())&&(p._titles=w),$e(w=Ge())&&(p._meta=w)}},viewQuery:function(d,p){if(d&1&&on$1(t,5)(i,5),d&2){let S;$e(S=Ge())&&(p._unscopedContent=S.first),$e(S=Ge())&&(p._itemText=S.first)}},hostAttrs:[1,`mat-mdc-list-item`,`mdc-list-item`],hostVars:13,hostBindings:function(d,p){d&2&&(ae(`aria-current`,p._getAriaCurrent()),ge(`mdc-list-item--activated`,p.activated)(`mdc-list-item--with-leading-avatar`,p._avatars.length!==0)(`mdc-list-item--with-leading-icon`,p._icons.length!==0)(`mdc-list-item--with-trailing-meta`,p._meta.length!==0)(`mat-mdc-list-item-both-leading-and-trailing`,p._hasBothLeadingAndTrailing())(`_mat-animation-noopable`,p._noopAnimations))},inputs:{activated:`activated`},exportAs:[`matListItem`],features:[kt$1],ngContentSelectors:[`[matListItemAvatar],[matListItemIcon]`,`[matListItemTitle]`,`[matListItemLine]`,`*`,`[matListItemMeta]`,`mat-divider`],decls:10,vars:0,consts:[[`unscopedContent`,``],[1,`mdc-list-item__content`],[1,`mat-mdc-list-item-unscoped-content`,3,`cdkObserveContent`],[1,`mat-focus-indicator`]],template:function(d,p){d&1&&(Pt(n),Ye$1(0),E(1,`span`,1),Ye$1(2,1),Ye$1(3,2),E(4,`span`,2,0),Q(`cdkObserveContent`,function(){return p._updateItemLines(!0)}),Ye$1(6,3),T()(),Ye$1(7,4),Ye$1(8,5),Ne(9,`div`,3))},dependencies:[got],encapsulation:2})})()}return e})();var nn=(()=>{class e{static ɵfac=function(i){return new(i||e)};static ɵmod=Pe({type:e});static ɵinj=Re({imports:[cx,Es,Y6,Ht,yv]})}return e})();var Ei=(()=>{class e{_extractionManagerService=p(xn$1);_extractionValidationService=p(Il);_rulesManagerService=p(El);_taxonomyManagerService=p(Tr);_stateService=p(jE);_featureFlagsService=p(Gi);_ignoreConfidence=this._featureFlagsService.enabledAsSignal(`fe-vs-ignore-confidence`);effectiveConfidenceThreshold=P(()=>this._ignoreConfidence()?0:this._stateService.confidenceThreshold()??0);isGroupingActive=P(()=>this._taxonomyManagerService.hasBusinessRulesDefined()||this.effectiveConfidenceThreshold()>0);_topLevelFields=P(()=>{let t=this._extractionManagerService.selectedDocumentTypeId();return t?this._extractionManagerService.entities().filter(i=>i.parentId===t).filter(zn$1):[]});_splitFields=P(()=>{let t=this._topLevelFields(),i=this.effectiveConfidenceThreshold();if(!this.isGroupingActive())return{valid:t,invalid:[],groupById:{}};let n=this._stateService.useOcrConfidence(),a=this._rulesManagerService.perFieldRuleSetsDictionary(),c=this._rulesManagerService.perTableFieldRuleSetsCriticalityDictionary(),d=[],p=[],S={};for(let w of t){let F=this._isFieldInvalid(w,i,n,a,c)?`invalid`:`valid`;S[w.id]=F,(F===`invalid`?p:d).push(w)}return{valid:d,invalid:p,groupById:S}});validFields=P(()=>this._splitFields().valid);invalidFields=P(()=>this._splitFields().invalid);groupOf(t){return!t||!this.isGroupingActive()?null:this._splitFields().groupById[t]??null}_isFieldInvalid(t,i,n,a,c){if(i>0){let d=n?t.ocrConfidence:t.confidence;if(be(d)&&d<i)return!0}return!!(!t.valueIds.length||a[t.fieldId]?.some(d=>!d.isValid)||c[t.fieldId])}static ɵfac=function(i){return new(i||e)};static ɵprov=O({token:e,factory:e.ɵfac,providedIn:`root`})}return e})();var Rt=(function(e){return e.Ocr=`ocr`,e.Extraction=`extraction`,e})(Rt||{});var an=(()=>{class e{_stateService=p(jE);value=P(()=>this._stateService.useOcrConfidence()?Rt.Ocr:Rt.Extraction);confidenceTypes=Rt;setConfidenceDisplay(t){this._stateService.useOcrConfidence.set(t===Rt.Ocr)}static ɵfac=function(i){return new(i||e)};static ɵcmp=te({type:e,selectors:[[`ui-du-vs-classic-confidence-switch`]],decls:14,vars:20,consts:[[`id`,`confidence-switch-label`],[`aria-labelledby`,`confidence-switch-label`,3,`value`],[`data-testid`,`confidence-toggle-ocr`,`automation-id`,`confidence-toggle-ocr`,1,`left-button-toggle`,3,`click`,`aria-label`,`value`,`matTooltip`],[`data-testid`,`confidence-toggle-extraction`,`automation-id`,`confidence-toggle-extraction`,1,`right-button-toggle`,3,`click`,`aria-label`,`value`,`matTooltip`]],template:function(i,n){if(i&1&&(E(0,`label`,0),H(1),B(2,`translate`),T(),E(3,`mat-button-toggle-group`,1),qn$1(4),B(5,`translate`),qn$1(6),B(7,`translate`),E(8,`mat-button-toggle`,2),B(9,`translate`),Q(`click`,function(){return n.setConfidenceDisplay(n.confidenceTypes.Ocr)}),H(10),T(),E(11,`mat-button-toggle`,3),B(12,`translate`),Q(`click`,function(){return n.setConfidenceDisplay(n.confidenceTypes.Extraction)}),H(13),T()()),i&2){x(),ze($(2,10,`VS_EXTRACTION_RESULTS_CONFIDENCE`)),x(2),K(`value`,n.value());let a=$(5,12,`VS_EXTRACTION_RESULTS_OCR`),c=$(7,14,`VS_EXTRACTION_RESULTS_EXTRACTION`);x(5),nm(`aria-label`,a),K(`value`,n.confidenceTypes.Ocr)(`matTooltip`,$(9,16,`VS_EXTRACTION_RESULTS_OCR_CONFIDENCE_SELECTION_TOOLTIP`)),x(2),Xe(``,a,` `),x(),nm(`aria-label`,c),K(`value`,n.confidenceTypes.Extraction)(`matTooltip`,$(12,18,`VS_EXTRACTION_RESULTS_EXTRACTION_CONFIDENCE_SELECTION_TOOLTIP`)),x(2),Xe(``,c,` `)}},dependencies:[Hn$1,gr,Ci,Ry,$F,eI,wt],styles:[`[_nghost-%COMP%]{--%NS%mat-button-toggle-height: 25px;--%NS%mat-button-toggle-selected-state-background-color: var(--%NS%color-background-pressed);--%NS%mat-button-toggle-selected-state-text-color: var(--%NS%color-primary);--%NS%mat-button-toggle-shape: 5px;display:flex;gap:12px;font-size:12px;padding:10px 15px;align-items:center}`]})}return e})();function On(e,o){if(e&1&&H(0),e&2){F();let t=Jt(0);Xe(` `,t.toLocaleLowerCase(),` `)}}var Oi=(()=>{class e{hotkey=ce();tooltip=ce();color=ce();bgColor=ce();defaultColor=NR.Colors.ColorWhite;defaultBgColor=NR.Colors.ColorPrimaryLight;static ɵfac=function(i){return new(i||e)};static ɵcmp=te({type:e,selectors:[[`ui-hotkey-box`]],hostVars:2,hostBindings:function(i,n){i&2&&ge(`ui-hotkey-box`,!0)},inputs:{hotkey:[1,`hotkey`],tooltip:[1,`tooltip`],color:[1,`color`],bgColor:[1,`bgColor`]},decls:3,vars:10,consts:[[1,`box`,3,`matTooltip`,`matTooltipDisabled`]],template:function(i,n){if(i&1&&(qn$1(0),E(1,`span`,0),ne(2,On,1,1),T()),i&2){let c=!!ni(n.hotkey());x(),Cr(`background`,n.bgColor()||n.defaultBgColor)(`color`,n.color()||n.defaultColor),ge(`help-cursor`,c&&n.tooltip()),K(`matTooltip`,n.tooltip()??``)(`matTooltipDisabled`,!c),x(),ie(c?2:-1)}},dependencies:[gr,Ci],styles:[`[_nghost-%COMP%]{display:inline-flex}[_nghost-%COMP%]   .box[_ngcontent-%COMP%]{display:inline-flex;align-items:center;justify-content:space-around;font-size:var(--%NS%apollo-font-m-size);height:24px;min-width:24px;box-sizing:border-box;padding:0 var(--%NS%apollo-pad-s)}[_nghost-%COMP%]   .box.help-cursor[_ngcontent-%COMP%]{cursor:help}`]})}return e})();function Vn(e,o){if(e&1&&(E(0,`div`,4),H(1),B(2,`translate`),T()),e&2){F(2);let t=Jt(1);ge(`italic`,!t),x(),Xe(` `,t||$(2,3,`VS_EXTRACTION_RESULT_VALIDATOR_EMPTY_NOTES_STRING`),`
`)}}function Ln(e,o){if(e&1){let t=nt();E(0,`mat-form-field`,3)(1,`ui-du-compact-base-textarea`,5),B(2,`translate`),Q(`valueChange`,function(n){Ce(t);let a=F(2);return Se(a.handleValueChange(n))}),T()()}if(e&2){F(2);let t=Jt(1);x(),K(`size`,`small`)(`value`,t)(`maxRows`,3)(`ariaLabel`,$(2,4,`VS_EXTRACTION_RESULT_VALIDATOR_NOTES_LABEL`))}}function An(e,o){if(e&1&&ne(0,Vn,3,5,`div`,2)(1,Ln,3,6,`mat-form-field`,3),e&2){let t=F();ie(t.isReadonly()?0:1)}}function Rn(e,o){if(e&1&&(E(0,`mat-radio-button`,7),H(1),T()),e&2){let t=o.$implicit;K(`value`,t),x(),ze(t)}}function Dn(e,o){if(e&1){let t=nt();E(0,`mat-radio-group`,6),B(1,`translate`),Q(`change`,function(n){Ce(t);let a=F();return Se(a.handleValueChange(n.value))}),Vn$1(2,Rn,2,2,`mat-radio-button`,7,Po),T()}if(e&2){let t=F(),i=Jt(0),n=Jt(1);K(`value`,n)(`disabled`,t.isReadonly()),ae(`aria-label`,$(1,3,`TAXO_VALIDATOR_NOTES_TYPE_ARIA_LABEL`)),x(2),Bn$1(i.options)}}var di=(()=>{class e extends nin{static ɵfac=(()=>{let t;return function(n){return(t||(t=Ot(e)))(n||e)}})();static ɵcmp=te({type:e,selectors:[[`ui-du-vs-classic-validator-notes`]],hostAttrs:[1,`ui-validator-notes`],features:[kt$1],decls:7,vars:6,consts:[[1,`notes-label`],[3,`value`,`disabled`],[`data-testid`,`readonly-text-note`,1,`readonly-text-note`,3,`italic`],[1,`material-default`,`apollo-textfield-small`,`no-subscript`],[`data-testid`,`readonly-text-note`,1,`readonly-text-note`],[3,`valueChange`,`size`,`value`,`maxRows`,`ariaLabel`],[3,`change`,`value`,`disabled`],[3,`value`]],template:function(i,n){if(i&1&&(qn$1(0)(1),E(2,`div`,0),H(3),B(4,`translate`),T(),ne(5,An,2,1)(6,Dn,4,5,`mat-radio-group`,1)),i&2){let a,c=ni(n.taxonomy());x(),ni(n.notes()?.value??``),x(2),Xe(` `,$(4,4,`VS_EXTRACTION_RESULT_VALIDATOR_NOTES_LABEL`),`
`),x(2),ie((a=c.type)===n.ValidatorNotesType.Text?5:a===n.ValidatorNotesType.Options?6:-1)}},dependencies:[ua$1,Bw,Gv,ug,vc,ha$1,Qt,_h,wt],styles:[`[_nghost-%COMP%]{display:flex;width:100%;justify-content:flex-start;align-items:center;gap:var(--%NS%apollo-pad-m)}[_nghost-%COMP%]   .notes-label[_ngcontent-%COMP%]{font-weight:var(--%NS%apollo-font-weight-semibold)}[_nghost-%COMP%]   .readonly-text-note.italic[_ngcontent-%COMP%]{font-style:italic}`]})}return e})();var ln=(()=>{class e{_extractionManagerService=p(xn$1);value=ce.required();anchor=ce(void 0);isMainAnchor=ce(!1);readonly=ce(!1);onValueChange(t,i){if(!i)return;let n=this.value();if(!n.anchorData)return;let a=n.anchorData.anchors.map(p=>p.id===i?z(y$1({},p),{text:t}):p),c=n.anchorData.mainAnchor.id===i?z(y$1({},n.anchorData.mainAnchor),{text:t}):n.anchorData.mainAnchor,d=z(y$1({},n),{confirmationStatus:Fe.Confirmed,confidence:1,anchorData:z(y$1({},n.anchorData),{mainAnchor:c,anchors:a})});this._extractionManagerService.updateExtractedPrimaryValue(d)}static ɵfac=function(i){return new(i||e)};static ɵcmp=te({type:e,selectors:[[`ui-du-vs-classic-anchor-input`]],hostAttrs:[1,`ui-anchor-input`],inputs:{value:[1,`value`],anchor:[1,`anchor`],isMainAnchor:[1,`isMainAnchor`],readonly:[1,`readonly`]},decls:4,vars:8,consts:[[3,`matTooltip`],[3,`valueChange`,`readonly`,`maxRows`,`value`]],template:function(i,n){i&1&&(E(0,`mat-icon`,0),B(1,`translate`),H(2,`anchor
`),T(),E(3,`ui-du-vs-classic-textbox`,1),Q(`valueChange`,function(c){let d;return n.onValueChange(c,(d=n.anchor())==null?null:d.id)}),T()),i&2&&(ge(`is-target`,n.isMainAnchor()),K(`matTooltip`,n.isMainAnchor()?$(1,6,`VS_ANCHOR_INPUT_TARGET_ANCHOR_ICON_TOOLTIP`):``),x(3),K(`readonly`,n.readonly())(`maxRows`,3)(`value`,n.anchor()?.text??``))},dependencies:[$n$1,yn$1,gr,Ci,Ue$1,wt],styles:[`[_nghost-%COMP%]{display:flex;align-items:flex-start}[_nghost-%COMP%] > mat-icon[_ngcontent-%COMP%]{margin-top:10px;margin-right:5px;transform:rotate(-25deg);height:18px;width:18px;font-size:18px;color:var(--%NS%color-foreground-secondary)}[_nghost-%COMP%] > mat-icon.is-target[_ngcontent-%COMP%]{color:var(--%NS%color-primary)}`]})}return e})();var Pn=e=>({anchorsNumber:e});var Fn=(e,o)=>o.id;function zn(e,o){e&1&&(E(0,`mat-error`),H(1),B(2,`translate`),T()),e&2&&(x(),Xe(` `,$(2,1,`VS_ANCHOR_VALUE_IS_REQUIRED_ERROR_MSG`),` `))}function Bn(e,o){e&1&&(E(0,`mat-error`),H(1),B(2,`translate`),T()),e&2&&(x(),Xe(` `,$(2,1,`VS_ANCHOR_TARGET_IS_REQUIRED_ERROR_MSG`),` `))}function Un(e,o){if(e&1&&Ne(0,`ui-du-vs-classic-anchor-input`,7),e&2){let t=o.$implicit;F();let i=Jt(0);K(`anchor`,t)(`value`,i)(`isMainAnchor`,!1)}}var on=(()=>{class e extends gr$1{static ɵfac=(()=>{let t;return function(n){return(t||(t=Ot(e)))(n||e)}})();static ɵcmp=te({type:e,selectors:[[`ui-du-vs-classic-anchor-value`]],features:[kt$1],decls:16,vars:26,consts:[[3,`field`,`taxonomy`,`value`,`valueIndex`,`textDirection`],[`ngProjectAs`,`content`,5,[`content`]],[1,`anchor-content`],[1,`icon`],[3,`change`,`revert`,`remove`,`markReferenceAsMissing`,`textDirectionChange`,`reverseWords`,`stateChange`,`disableChange`,`disableRevert`,`displayMarkReferenceAsMissing`,`disableMarkReferenceAsMissing`,`displayRemove`,`displayTextDirection`,`displayReverseWords`,`shouldMarkAsMissingInsteadOfRemove`,`shouldAddInsteadOfChange`,`hotkeys`],[`ngProjectAs`,`after-content`,5,[`after-content`]],[1,`anchors`],[3,`anchor`,`value`,`isMainAnchor`]],template:function(i,n){if(i&1&&(qn$1(0),E(1,`ui-du-vs-classic-value-shell`,0),Lo(2,1),E(3,`div`,2),H(4),B(5,`translate`),E(6,`mat-icon`,3),H(7,`anchor`),T(),ne(8,zn,3,3,`mat-error`)(9,Bn,3,3,`mat-error`),T(),E(10,`ui-compact-actions-menu`,4),Q(`change`,function(){return n.changeExtractedValue()})(`revert`,function(){return n.revertToPreviousValue()})(`remove`,function(){return n.removeExtractedValue()})(`markReferenceAsMissing`,function(){return n.markReferenceAsMissing()})(`textDirectionChange`,function(c){return n.onTextDirectionChange(c)})(`reverseWords`,function(){return n.reverseWords()})(`stateChange`,function(c){return n.menuOpen.set(c===`open`)}),T(),Vo(),Lo(11,5),E(12,`div`,6),Ne(13,`ui-du-vs-classic-anchor-input`,7),Vn$1(14,Un,1,3,`ui-du-vs-classic-anchor-input`,7,Fn),T(),Vo(),T()),i&2){let a=n.field(),c=n.taxonomy(),d=ni(n.value());x(),K(`field`,a)(`taxonomy`,c)(`value`,d)(`valueIndex`,n.valueIndex())(`textDirection`,n.textDirection()),x(3),Xe(` `,ro(5,21,`VS_ANCHOR_VALUE_NUMBER_OF_ANCHORS`,Wr(24,Pn,(d.anchorData?.anchors?.length||0)+1)),` `);let p=n.validationError();x(4),ie(p===n.ValidationCode.AnchorTextRequired?8:p===n.ValidationCode.AnchorTargetRequired?9:-1),x(2),K(`disableChange`,!n.pdfHasValidSelectionForValue())(`disableRevert`,!n.hasHistory())(`displayMarkReferenceAsMissing`,n.displayMarkReferenceAsMissing())(`disableMarkReferenceAsMissing`,!n.canMarkReferenceAsMissing())(`displayRemove`,c.type!==n.TaxonomyDefinitionType.DocumentType)(`displayTextDirection`,n.displayRTLFeatures())(`displayReverseWords`,n.displayRTLFeatures())(`shouldMarkAsMissingInsteadOfRemove`,a.valueIds.length===1)(`shouldAddInsteadOfChange`,a.valueIds.length===0)(`hotkeys`,n.hotkeys()),x(3),K(`anchor`,d.anchorData==null?null:d.anchorData.mainAnchor)(`value`,d)(`isMainAnchor`,!0),x(),Bn$1(d.anchorData?.anchors)}},dependencies:[dd,_v,$n$1,yn$1,von,ue,ln,wt],styles:[`[_nghost-%COMP%]   .anchor-content[_ngcontent-%COMP%]{position:relative;margin-bottom:1.25em;padding-top:1.28125em;max-width:100%;max-height:160px;flex-grow:1;display:flex;align-items:center}[_nghost-%COMP%]   .anchor-content[_ngcontent-%COMP%]   .icon[_ngcontent-%COMP%]{transform:rotate(-25deg);margin-left:5px;height:18px;width:18px;font-size:18px}[_nghost-%COMP%]   .anchor-content[_ngcontent-%COMP%] > .mat-mdc-form-field-error[_ngcontent-%COMP%]{position:absolute;bottom:-15px;font-size:75%}[_nghost-%COMP%]   .anchors[_ngcontent-%COMP%]{margin:0 40px 0 36px;padding:0 0 0 16px;border-left:1px solid var(--%NS%color-border)}`]})}return e})();var Hn=(e,o)=>o.id;function Xn(e,o){if(e&1&&Ne(0,`ui-confidence`,3),e&2){let t=F().$implicit,i=F();K(`tooltip`,i.confidenceTooltipKey())(`confidence`,(i.useOcrConfidence()?t.ocrConfidence:t.confidence)??void 0)(`unitInterval`,!0)}}function jn(e,o){e&1&&(E(0,`mat-icon`,6),H(1,`check`),T())}function Gn(e,o){if(e&1){let t=nt();E(0,`mat-icon`,8),B(1,`translate`),Q(`click`,function(){Ce(t);let n=F().$index,a=F();return Se(a.onCheckboxClick(n))}),H(2,`swap_vert`),T()}e&2&&K(`matTooltip`,$(1,1,`VS_VALUE_SWAP_SUGGESTION`)+` (Enter)`)}function Wn(e,o){if(e&1){let t=nt();E(0,`mat-list-item`,2),Q(`click`,function(){let n=Ce(t).$index,a=F();return Se(a.highlightSuggestion(n))}),ne(1,Xn,1,3,`ui-confidence`,3),E(2,`span`,4),H(3),T(),E(4,`div`,5),ne(5,jn,2,0,`mat-icon`,6)(6,Gn,3,3,`mat-icon`,7),T()()}if(e&2){let t=o.$implicit,i=o.$index,n=F();ge(`highlighted`,n.highlightedSuggestionIndex()===i),K(`id`,`suggestion-option-id-`+t.id),ae(`data-testid`,`suggestion-item_`+i+`_`+t.id)(`aria-labelledby`,`suggestion-option-id-`+t.id)(`aria-selected`,n.selectedSuggestionIndex()===i),x(),ie(n.showConfidence()?1:-1),x(2),ze(t.value),x(2),ie(n.selectedSuggestionIndex()===i?5:6)}}var rn=(()=>{class e extends _r{_stateService=p(jE);closed=Wt();isOpen=me(!0);useOcrConfidence=this._stateService.useOcrConfidence;confidenceTooltipKey=P(()=>this.useOcrConfidence()?`VS_VALUE_CONFIDENCE_OCR_TOOLTIP`:`VS_VALUE_CONFIDENCE_EXTRACTION_TOOLTIP`);onClose(t){super.onClose(t),this.closed.emit()}highlightSuggestion(t){this.highlightedSuggestionIndex.set(mu(t,0,this.suggestionModels().length-1))}ngOnDestroy(){this.onClose()}static ɵfac=(()=>{let t;return function(n){return(t||(t=Ot(e)))(n||e)}})();static ɵcmp=te({type:e,selectors:[[`ui-du-vs-classic-suggestions`]],outputs:{closed:`closed`},features:[kt$1],decls:4,vars:4,consts:[[`data-testid`,`suggestions-list`,`tabindex`,`0`,`role`,`listbox`,3,`keyup.arrowup`,`keyup.arrowleft`,`keyup.arrowdown`,`keyup.arrowright`,`keydown.enter`,`keydown.space`,`keydown.tab`,`keydown.shift.tab`],[`role`,`option`,`data-testid`,`suggestion-option`,3,`highlighted`,`id`],[`role`,`option`,`data-testid`,`suggestion-option`,3,`click`,`id`],[`matListItemIcon`,``,`confidenceUndefinedTooltip`,`VS_CONFIDENCE_NOT_REPORTED_TOOLTIP`,1,`suggestion-confidence`,3,`tooltip`,`confidence`,`unitInterval`],[`matListItemTitle`,``,1,`value`],[`matListItemMeta`,``],[`color`,`primary`,`automation-id`,`checkmark`,`data-testid`,`checkmark`],[`data-testid`,`replace`,`automation-id`,`replace`,1,`suggestion-replace`,3,`matTooltip`],[`data-testid`,`replace`,`automation-id`,`replace`,1,`suggestion-replace`,3,`click`,`matTooltip`]],template:function(i,n){if(i&1&&(E(0,`mat-list`,0),B(1,`translate`),Q(`keyup.arrowup`,function(){return n.navigateThroughOptions(`up`)})(`keyup.arrowleft`,function(){return n.navigateThroughOptions(`up`)})(`keyup.arrowdown`,function(){return n.navigateThroughOptions(`down`)})(`keyup.arrowright`,function(){return n.navigateThroughOptions(`down`)})(`keydown.enter`,function(c){return n.replaceSuggestionViaKeyboard(c)})(`keydown.space`,function(c){return n.replaceSuggestionViaKeyboard(c)})(`keydown.tab`,function(){return n.onClose()})(`keydown.shift.tab`,function(){return n.onClose()}),Vn$1(2,Wn,7,9,`mat-list-item`,1,Hn),T()),i&2){let a=n.suggestionModels();ae(`aria-label`,$(1,2,`VS_COMPACT_FIELD_VALUE_SUGGESTIONS_TITLE`))(`aria-activedescendant`,n.highlightedSuggestion()?`suggestion-option-id-`+n.highlightedSuggestion()?.id:null),x(2),Bn$1(a)}},dependencies:[$n$1,yn$1,nn,tn,en,Ii,Mi,Ni,gr,Ci,je,wt],styles:[`[_nghost-%COMP%]   mat-list-item[_ngcontent-%COMP%]{min-height:3em}[_nghost-%COMP%]   mat-list-item[_ngcontent-%COMP%]:not(.highlighted):hover{background-color:var(--%NS%color-background-hover)}[_nghost-%COMP%]   mat-list-item.highlighted[_ngcontent-%COMP%]{background-color:var(--%NS%color-background-pressed)}[_nghost-%COMP%]   .suggestion-replace[_ngcontent-%COMP%]{cursor:pointer}[_nghost-%COMP%]   .suggestion-replace[_ngcontent-%COMP%]:hover{color:var(--%NS%color-foreground-link)}`]})}return e})();var $n=(e,o)=>[e,o];function Qn(e,o){e&1&&(E(0,`span`,7),B(1,`translate`),H(2),B(3,`translate`),T()),e&2&&(K(`matTooltip`,$(1,2,`VS_SIMPLE_FIELD_REMOVED_MESSAGE_TOOLTIP`)),x(2),Xe(` `,$(3,4,`VS_SIMPLE_FIELD_REMOVED_MESSAGE`),` `))}function qn(e,o){e&1&&(E(0,`span`,7),B(1,`translate`),H(2),B(3,`translate`),T()),e&2&&(K(`matTooltip`,$(1,2,`VS_SIMPLE_FIELD_NO_DATA_MESSAGE_TOOLTIP`)),x(2),Xe(` `,$(3,4,`VS_SIMPLE_FIELD_NO_DATA_MESSAGE`),` `))}function Kn(e,o){if(e&1&&(E(0,`i`,3),ne(1,Qn,4,6,`span`,7)(2,qn,4,6,`span`,7),T()),e&2){let t=F(),i=Jt(0);x(),ie(i.confirmationStatus===t.ConfirmationStatus.Confirmed?1:2)}}function Yn(e,o){e&1&&(E(0,`mat-error`,11),H(1),B(2,`translate`),T()),e&2&&(x(),Xe(` `,$(2,1,`VS_TABLE_FIELD_MISSING_CELL_VALUE_ERROR_MSG`),` `))}function Zn(e,o){if(e&1&&(E(0,`div`,10),ne(1,Yn,3,3,`mat-error`,11),T()),e&2){F();let t=Jt(6),i=F();x(),ie(t===i.ValidationCode.InvalidCells?1:-1)}}function Jn(e,o){if(e&1&&(E(0,`div`,8)(1,`span`),H(2),B(3,`translate`),T(),E(4,`mat-icon`,9),H(5,`apps`),T()(),qn$1(6),ne(7,Zn,2,1,`div`,10)),e&2){x(2),ze($(3,2,`VS_TABLE_FIELD_TITLE`)),x(4);let t=ni(F().validationError());x(),ie(t?7:-1)}}function ta(e,o){if(e&1&&(Lo(0,4),Ne(1,`ui-du-vs-classic-validator-notes`,12),Vo()),e&2){let t=F(),i=Jt(0),n=Jt(7),a=Jt(8);x(),K(`fieldId`,i.id)(`taxonomy`,n)(`notes`,a)(`appInReadonlyMode`,t.readonly())}}function ia(e,o){if(e&1){let t=nt();qn$1(0),B(1,`translate`),qn$1(2),B(3,`uiHotkeysComboDisplay`),E(4,`button`,13),Q(`click`,function(){Ce(t);let n=F();return Se(n.revertToPreviousValue())}),E(5,`mat-icon`),H(6,`undo`),T()(),qn$1(7),B(8,`translate`),E(9,`button`,14),Ne(10,`mat-icon`,15),T()}if(e&2){let t,i=F(),n=$(1,5,`VS_SIMPLE_FIELD_REVERT_TOOLTIP`),a=$(3,7,(t=i.hotkeys())==null||t.revert==null?null:t.revert.combos);x(4),nm(`aria-label`,n),K(`matTooltip`,go(11,$n,n,a).join(` `))(`disabled`,!i.hasHistory());let c=$(8,9,`VS_SIMPLE_FIELD_CREATE_NEW_TABLE_VALUE_TOOLTIP`);x(5),nm(`aria-label`,c),K(`matTooltip`,c)}}function ea(e,o){if(e&1){let t=nt();E(0,`ui-compact-actions-menu`,16),Q(`revert`,function(){Ce(t);let n=F();return Se(n.revertToPreviousValue())})(`remove`,function(){Ce(t);let n=F();return Se(n.removeExtractedValue())}),T()}if(e&2){let t=F(),i=Jt(1);K(`disableRevert`,!t.hasHistory())(`disableRemove`,i)(`displayChange`,!1)(`displayTextDirection`,!1)(`displayReverseWords`,!1)(`shouldAddInsteadOfChange`,!0)(`hotkeys`,t.hotkeys())}}var mn=(()=>{class e extends Wi{removeExtractedValue(){let t=this.field().id;this._extractionManagerService.setSelectedValue(t);let i=this.field(),n=[...i.valueIds,i.headerRowId];this._extractionManagerService.removeExtractedValues(t,n,void 0,!0),this._tableService.isTableEditorVisible.set(!1)}static ɵfac=(()=>{let t;return function(n){return(t||(t=Ot(e)))(n||e)}})();static ɵcmp=te({type:e,selectors:[[`ui-du-vs-classic-table-value`]],hostAttrs:[1,`ui-table-value`],features:[kt$1],decls:13,vars:12,consts:[[3,`click`,`field`,`taxonomy`,`value`,`valueIndex`,`readonly`],[`ngProjectAs`,`content`,5,[`content`]],[1,`content-wrapper`],[`data-testid`,`missing-value-message`,1,`text`],[`ngProjectAs`,`validator-notes-value-level`,5,[`validator-notes-value-level`]],[`ngProjectAs`,`post-suffix-content`,5,[`post-suffix-content`]],[3,`disableRevert`,`disableRemove`,`displayChange`,`displayTextDirection`,`displayReverseWords`,`shouldAddInsteadOfChange`,`hotkeys`],[3,`matTooltip`],[1,`top-side`],[`fontSet`,`material-icons-outlined`],[1,`bottom-side`],[`data-testid`,`error`],[`data-testid`,`validator-notes`,1,`validator-notes`,3,`fieldId`,`taxonomy`,`notes`,`appInReadonlyMode`],[`mat-icon-button`,``,`data-testid`,`missing-value-revert`,3,`click`,`aria-label`,`matTooltip`,`disabled`],[`mat-icon-button`,``,`data-testid`,`missing-value-add`,3,`aria-label`,`matTooltip`],[`svgIcon`,`ui_add_grid`],[3,`revert`,`remove`,`disableRevert`,`disableRemove`,`displayChange`,`displayTextDirection`,`displayReverseWords`,`shouldAddInsteadOfChange`,`hotkeys`]],template:function(i,n){if(i&1&&(qn$1(0)(1),E(2,`ui-du-vs-classic-value-shell`,0),Q(`click`,function(){return n.openTableEditor()}),Lo(3,1),E(4,`div`,2),ne(5,Kn,3,1,`i`,3)(6,Jn,8,5),T(),Vo(),qn$1(7)(8),ne(9,ta,2,4,`ng-container`,4),Lo(10,5),ne(11,ia,11,14)(12,ea,1,7,`ui-compact-actions-menu`,6),Vo(),T()),i&2){let a=ni(n.field());x();let c=ni(!a.valueIds.length);x(),K(`field`,a)(`taxonomy`,n.taxonomy())(`value`,n.dummyPrimaryValue())(`valueIndex`,0)(`readonly`,n.readonly()),x(3),ie(c?5:6),x(2);let d=ni(n.validatorNotesTaxonomy());x(),ni(n.validatorNotes()),x(),ie(d&&d.enabled&&d.level===n.validatorNotesLevel.Value&&!c?9:-1),x(2),ie(c?11:n.readonly()?-1:12)}},dependencies:[$n$1,yn$1,gr,Ci,Hn$1,Zn$1,dd,_v,ue,di,von,wt,oU],styles:[`[_nghost-%COMP%]   .content-wrapper[_ngcontent-%COMP%]{display:flex;flex-direction:column;flex-grow:1;padding-left:8px;justify-content:center}[_nghost-%COMP%]   .content-wrapper[_ngcontent-%COMP%]   .top-side[_ngcontent-%COMP%]{display:flex;justify-content:flex-end;align-items:center;flex-grow:1;gap:12px;color:var(--%NS%color-foreground-secondary)}[_nghost-%COMP%]   .content-wrapper[_ngcontent-%COMP%]   .bottom-side[_ngcontent-%COMP%]{flex-grow:1;font-size:var(--%NS%apollo-font-xs-size)}[_nghost-%COMP%]   .content-wrapper[_ngcontent-%COMP%]   .bottom-side[_ngcontent-%COMP%]   .text[_ngcontent-%COMP%]{color:var(--%NS%color-foreground-secondary)}[_nghost-%COMP%]   .content-wrapper.no-values[_ngcontent-%COMP%]{flex-direction:row;padding-left:0}`]})}return e})();var na=e=>({key:e});var aa=(e,o)=>o.id;function sa(e,o){e&1&&(E(0,`mat-icon`,17),B(1,`translate`),H(2,` anchor `),T()),e&2&&K(`matTooltip`,gs($(1,2,`VS_FIELD_EDIT_CAPABILITIES_ANCHORS_TOOLTIP`)))}function la(e,o){e&1&&(E(0,`mat-icon`,18),B(1,`translate`),H(2,`crop_free`),T()),e&2&&K(`matTooltip`,gs($(1,2,`VS_FIELD_EDIT_CAPABILITIES_AREA_ONLY_TOOLTIP`)))}function oa(e,o){e&1&&(E(0,`mat-icon`,19),B(1,`translate`),H(2,`short_text`),T()),e&2&&K(`matTooltip`,gs($(1,2,`VS_FIELD_EDIT_CAPABILITIES_TOKENS_ONLY_TOOLTIP`)))}function ra(e,o){if(e&1&&(E(0,`span`,6),ne(1,sa,3,4,`mat-icon`,17),ne(2,la,3,4,`mat-icon`,18),ne(3,oa,3,4,`mat-icon`,19),T()),e&2){F();let t=Jt(5);x(),ie(t.anchor?1:-1),x(),ie(t.area?2:-1),x(),ie(t.tokens?3:-1)}}function ma(e,o){e&1&&(E(0,`mat-chip`,8),H(1),B(2,`translate`),T()),e&2&&(x(),Xe(` `,$(2,1,`TAXO_FIELD_DEFAULT_VALUE`),` `))}function ca(e,o){e&1&&(E(0,`mat-chip`,9),H(1),B(2,`translate`),T()),e&2&&(x(),Xe(` `,$(2,1,`VS_FIELD_VALUE_VALIDATED_CHIP`),` `))}function da(e,o){if(e&1){let t=nt();qn$1(0),B(1,`uiHotkeysComboDisplay`),E(2,`ui-counter`,20),B(3,`translate`),Q(`click`,function(){Ce(t);let n=F();return Se(n.toggleSuggestions())}),T()}if(e&2){let t,i=F(),n=$(1,5,(t=i.toggleSuggestionsShortcut())==null?null:t.combos)??``;x(2),K(`tooltip`,Oa$1(``,$(3,7,`VS_FIELD_VALUE_SUGGESTION_COUNTER_TOOLTIP`),` `,n))(`active`,i.suggestionsOpen())(`value`,i.suggestions().length)}}function ha(e,o){if(e&1&&Ne(0,`ui-du-vs-classic-validator-notes`,21),e&2){F();let t=Jt(0),i=Jt(1),n=F(),a=Jt(2);K(`fieldId`,a.id)(`taxonomy`,t)(`notes`,i)(`appInReadonlyMode`,n.readonly())}}function pa(e,o){if(e&1&&(qn$1(0)(1),ne(2,ha,1,4,`ui-du-vs-classic-validator-notes`,21)),e&2){let t=F(),i=Jt(2),n=Jt(3),a=ni(n.validatorNotes);x(),ni(i.validatorNotes),x(),ie(a&&a.enabled&&a.level===t.ValidatorNotesLevel.Field?2:-1)}}function _a(e,o){if(e&1&&Ne(0,`ui-du-vs-classic-table-value`,14),e&2){let t=F(),i=Jt(2),n=Jt(3),a=i.valueIds.length?(t.readonly()?`readonly-`:``)+`field-value_0_0`:`missing-field-value`;K(`field`,i)(`taxonomy`,n)(`readonly`,t.readonly()),ae(`data-testid`,a)}}function ga(e,o){e&1&&H(0,` Field Groups are not supported in classic `)}function ua(e,o){if(e&1&&Ne(0,`ui-du-vs-classic-readonly-value`,22),e&2){F(3);let t=Jt(2),i=Jt(3);K(`field`,t)(`taxonomy`,i)(`value`,null)(`valueIndex`,-1)}}function ba(e,o){if(e&1&&Ne(0,`ui-du-vs-classic-missing-value`,23),e&2){F(3);let t=Jt(2),i=Jt(3);K(`field`,t)(`taxonomy`,i)(`valueIndex`,-1)}}function fa(e,o){if(e&1&&ne(0,ua,1,4,`ui-du-vs-classic-readonly-value`,22)(1,ba,1,3,`ui-du-vs-classic-missing-value`,23),e&2){let t=F(2);ie(t.readonly()?0:1)}}function va(e,o){if(e&1&&Vn$1(0,ga,1,0,null,null,Po,!1,fa,2,1),e&2){F();let t=Jt(2);Bn$1(t.valueIds)}}function xa(e,o){if(e&1&&Ne(0,`ui-du-vs-classic-readonly-value`,24),e&2){let t=F(),i=t.$implicit,n=t.$index,a=Jt(0),c=F(2),d=Jt(2),p=Jt(3);K(`field`,d)(`taxonomy`,p)(`value`,i)(`valueIndex`,c.parentValueIndex()??n),ae(`data-testid`,a)}}function ya(e,o){if(e&1&&Ne(0,`ui-du-vs-classic-anchor-value`,24),e&2){let t=F(2),i=t.$implicit,n=t.$index,a=Jt(0),c=F(2),d=Jt(2),p=Jt(3);K(`field`,d)(`taxonomy`,p)(`value`,i)(`valueIndex`,c.parentValueIndex()??n),ae(`data-testid`,a)}}function wa(e,o){if(e&1&&Ne(0,`ui-du-vs-classic-simple-value`,24),e&2){let t=F(2),i=t.$implicit,n=t.$index,a=Jt(0),c=F(2),d=Jt(2),p=Jt(3);K(`field`,d)(`taxonomy`,p)(`value`,i)(`valueIndex`,c.parentValueIndex()??n),ae(`data-testid`,a)}}function ka(e,o){if(e&1&&ne(0,ya,1,5,`ui-du-vs-classic-anchor-value`,24)(1,wa,1,5,`ui-du-vs-classic-simple-value`,24),e&2){let t=F().$implicit;ie(t.isAnchorBased?0:1)}}function Ca(e,o){e&1&&Ne(0,`mat-divider`)}function Sa(e,o){if(e&1&&(qn$1(0),ne(1,xa,1,5,`ui-du-vs-classic-readonly-value`,24)(2,ka,2,1),ne(3,Ca,1,0,`mat-divider`)),e&2){let t=o.$index,i=o.$count,n=F(2),a=Jt(3);ni(`ui-value`+t),x(),ie(n.readonly()?1:a.type!==n.TaxonomyDefinitionType.FieldGroup&&a.type!==n.TaxonomyDefinitionType.Table?2:-1),x(2),ie(t!==i-1?3:-1)}}function Ta(e,o){if(e&1&&Ne(0,`ui-du-vs-classic-readonly-value`,22),e&2){F(3);let t=Jt(2),i=Jt(3);K(`field`,t)(`taxonomy`,i)(`value`,null)(`valueIndex`,-1)}}function Ma(e,o){if(e&1&&Ne(0,`ui-du-vs-classic-missing-value`,23),e&2){F(3);let t=Jt(2),i=Jt(3);K(`field`,t)(`taxonomy`,i)(`valueIndex`,-1)}}function Na(e,o){if(e&1&&ne(0,Ta,1,4,`ui-du-vs-classic-readonly-value`,22)(1,Ma,1,3,`ui-du-vs-classic-missing-value`,23),e&2){let t=F(2),i=Jt(4);ie(t.readonly()?0:i?-1:1)}}function Ia(e,o){if(e&1&&Vn$1(0,Sa,4,3,null,null,aa,!1,Na,2,1),e&2){let t=F();Bn$1(t.fieldValues())}}function Ea(e,o){if(e&1){let t=nt();qn$1(0),B(1,`translate`),E(2,`div`,15)(3,`button`,25),B(4,`uiHotkeysComboDisplay`),Q(`click`,function(){Ce(t);let n=F();return Se(n.addNewValueToField())}),E(5,`mat-icon`),H(6,`library_add`),T()()()}if(e&2){let t,i=F(),n=Jt(3),a=$(1,4,i.multiValueButtonTooltip()),c=n.requiresReference?`create-value-with-reference`:`create-value-without-reference`;x(3),K(`matTooltip`,a+` `+$(4,6,(t=i.addValueShortcut())==null?null:t.combos))(`disabled`,!i.canAddNewValue()),ae(`data-testid`,c)(`aria-label`,a)}}function Oa(e,o){if(e&1){let t=nt();E(0,`mat-card`,16)(1,`mat-card-content`)(2,`ui-du-vs-classic-suggestions`,26),Q(`closed`,function(){Ce(t);let n=F();return Se(n.closeSuggestions())}),T()()()}if(e&2){let t=F(),i=Jt(2),n=Jt(3);x(2),K(`field`,i)(`taxonomy`,n)(`readonly`,t.readonly())}}var cn=(()=>{class e extends fr{ExtractionSource=vn$1;ConfirmationStatus=Fe;assignHotkeyTooltip=P(()=>this.assignHotkey()!=null?`VS_FIELD_COLOR_CODED_HOTKEY_TOOLTIP`:`VS_FIELD_COLOR_CODED_HOTKEY_MISSING_TOOLTIP`);_isAnchorSelectionModeEnabled=this._featureFlagsService.enabledAsSignal(`fe-vs-anchor-selection-mode`);capabilityIcons=P(()=>Qen(this._configurationsManagerService.getFieldCustomization(this.field().fieldId).referenceEditModes,this._isAnchorSelectionModeEnabled()));suggestionsOpen=_s(()=>this.isSelected()&&this.hasSuggestions()&&!1);suggestions=P(()=>{let t=this.field();return this._extractionManagerService.suggestionsByParentId()[t.id]??[]});canShowSuggestions=P(()=>this.hasSuggestions()&&this.field().type===W.Field&&this.taxonomy().type===Be.Field);toggleSuggestionsShortcut=P(()=>this._vsKeyboardShortcutsService.fields()?.toggleSuggestions);constructor(){super(),At(t=>{let i=this._registerClassicHotKeys();t(()=>i?.unsubscribe())})}toggleSuggestions(){this.suggestionsOpen.update(t=>!t)}closeSuggestions(){this.suggestionsOpen.set(!1)}_registerClassicHotKeys(){let i=[this.toggleSuggestionsShortcut()].filter(be);return this._vsKeyboardShortcutsService.listen$(i).pipe(X(()=>this.isSelected()&&this.canShowSuggestions())).subscribe(n=>{this._vsKeyboardShortcutsService.recordPress(n),this.toggleSuggestions()})}static ɵfac=function(i){return new(i||e)};static ɵcmp=te({type:e,selectors:[[`ui-du-vs-classic-field`]],features:[kt$1],decls:31,vars:37,consts:[[1,`ui-field`],[1,`data-point`],[`appearance`,`outlined`,1,`field-card`],[1,`header-container`],[1,`name-container`],[3,`hotkey`,`bgColor`,`tooltip`],[1,`edit-reference-capabilities-icon`],[`uiDuSharedSetTitleWhenEllipsesActive`,``,`data-testid`,`field-name`,1,`field-name`],[`data-testid`,`defaulted-chip`,`disableRipple`,`true`,1,`chip-mini`,`validated-chip`],[`data-testid`,`validated-chip`,`disableRipple`,`true`,1,`chip-mini`,`validated-chip`],[1,`field-suggestion-count`,3,`tooltip`,`active`,`value`],[1,`tail-container`],[3,`ruleSet`],[`data-testid`,`field-values`,1,`values`],[3,`field`,`taxonomy`,`readonly`],[1,`add-value`],[`appearance`,`outlined`,1,`field-suggestions-card`],[`data-testid`,`capabilities-icon-anchor`,3,`matTooltip`],[`data-testid`,`capabilities-icon-area`,`color`,`warn`,3,`matTooltip`],[`data-testid`,`capabilities-icon-tokens`,`color`,`primary`,3,`matTooltip`],[1,`field-suggestion-count`,3,`click`,`tooltip`,`active`,`value`],[`data-testid`,`validator-notes`,1,`validator-notes`,3,`fieldId`,`taxonomy`,`notes`,`appInReadonlyMode`],[`data-testid`,`readonly-missing-field-value`,3,`field`,`taxonomy`,`value`,`valueIndex`],[`data-testid`,`missing-field-value`,3,`field`,`taxonomy`,`valueIndex`],[3,`field`,`taxonomy`,`value`,`valueIndex`],[`mat-icon-button`,``,`color`,`primary`,3,`click`,`matTooltip`,`disabled`],[3,`closed`,`field`,`taxonomy`,`readonly`]],template:function(i,n){if(i&1&&(qn$1(0),B(1,`uiHotkeysComboDisplay`),qn$1(2)(3)(4)(5),E(6,`div`,0)(7,`div`,1)(8,`mat-card`,2)(9,`mat-card-content`)(10,`div`,3)(11,`div`,4),Ne(12,`ui-hotkey-box`,5),B(13,`translate`),ne(14,ra,4,3,`span`,6),E(15,`span`,7),H(16),B(17,`translate`),T(),E(18,`mat-chip-listbox`),ne(19,ma,3,3,`mat-chip`,8)(20,ca,3,3,`mat-chip`,9),T(),ne(21,da,4,9,`ui-counter`,10),T(),E(22,`div`,11),Ne(23,`ui-du-vs-classic-field-rule-set`,12),T()(),ne(24,pa,3,3),E(25,`div`,13),ne(26,_a,1,4,`ui-du-vs-classic-table-value`,14)(27,va,3,1)(28,Ia,3,1),T(),ne(29,Ea,7,8,`div`,15),T()(),ne(30,Oa,3,3,`mat-card`,16),T()()),i&2){let a,c=ro(1,23,(a=n.assignHotkey())==null?null:a.combos,!1)??``;x(2);let d=ni(n.field());x();let p=ni(n.taxonomy()),S=n.isSelected();x();let w=ni(p.type===n.TaxonomyDefinitionType.DocumentType);x();let F=ni(n.capabilityIcons());x(),ae(`data-testid`,w?`doc-type-field`:`field`),x(2),Cr(`border-left-color`,S?p.color:null),ge(`mat-elevation-z0-custom`,S)(`mat-elevation-z0`,!S),x(3),Cr(`border-color`,S?p.color:`transparent`),x(),K(`hotkey`,c)(`bgColor`,p.color)(`tooltip`,ro(13,30,n.assignHotkeyTooltip(),Wr(35,na,c))),x(2),ie(F?14:-1),x(2),Xe(` `,w?$(17,33,`VS_DOCTYPE_LABEL`):p.name,` `),x(3),ie(d.dataSource===n.ExtractionSource.Defaulted?19:!d.valueIds.length&&d.confirmationStatus===n.ConfirmationStatus.Confirmed?20:-1),x(2),ie(n.hasSuggestions()&&d.type===n.ValueType.Field&&p.type===n.TaxonomyDefinitionType.Field?21:-1),x(2),K(`ruleSet`,p.type===n.TaxonomyDefinitionType.DocumentType?void 0:p.ruleSet),x(),ie(p.type!==n.TaxonomyDefinitionType.DocumentType?24:-1),x(),ge(`full-height`,d.valueIds.length===1),x(),ie(p.type===n.TaxonomyDefinitionType.Table&&d.type===n.ValueType.Table?26:p.type===n.TaxonomyDefinitionType.FieldGroup&&d.type===n.ValueType.FieldGroup?27:28),x(3),ie(!n.readonly()&&p.type!==n.TaxonomyDefinitionType.DocumentType&&p.type!==n.TaxonomyDefinitionType.Table&&p.multiValued&&d.valueIds.length?29:-1),x(),ie(n.suggestionsOpen()&&d.type===n.ValueType.Field&&p.type===n.TaxonomyDefinitionType.Field?30:-1)}},dependencies:[$n$1,yn$1,gr,Ci,Hn$1,Zn$1,mR,xj,wj,iDt,sR,mxe,Xx,yv,xut,FSe,Oi,Ra$1,di,rn,xr$1,Wo,Rr,mn,xa$1,on,wt,oU],styles:[`.ui-field[_ngcontent-%COMP%]{display:flex;padding:4px 4px 4px 8px;transition:background-color .2s cubic-bezier(.35,0,.25,1);background-color:var(--%NS%color-background)}.ui-field[_ngcontent-%COMP%]:hover{background-color:var(--%NS%color-background-hover)}.ui-field[_ngcontent-%COMP%]   .header-container[_ngcontent-%COMP%]{display:flex;justify-content:space-between;align-items:center;color:var(--%NS%color-foreground)}.ui-field[_ngcontent-%COMP%]   .header-container[_ngcontent-%COMP%]   .name-container[_ngcontent-%COMP%]{display:flex;flex:1 0 155px;flex-wrap:wrap;min-height:40px;margin-right:4px;box-sizing:border-box;align-items:center;font-weight:500;border-left:4px solid;white-space:nowrap}.ui-field[_ngcontent-%COMP%]   .header-container[_ngcontent-%COMP%]   .name-container[_ngcontent-%COMP%]   .ui-hotkey-box[_ngcontent-%COMP%]{margin-left:8px;margin-right:12px}.ui-field[_ngcontent-%COMP%]   .header-container[_ngcontent-%COMP%]   .name-container[_ngcontent-%COMP%]   .validated-chip[_ngcontent-%COMP%]{font-size:var(--%NS%apollo-font-s-size)}.ui-field[_ngcontent-%COMP%]   .header-container[_ngcontent-%COMP%]   .name-container[_ngcontent-%COMP%]   .mdc-evolution-chip-set__chips[_ngcontent-%COMP%]{flex-wrap:nowrap}.ui-field[_ngcontent-%COMP%]   .header-container[_ngcontent-%COMP%]   .name-container[_ngcontent-%COMP%]   .edit-reference-capabilities-icon[_ngcontent-%COMP%]{display:flex;flex-direction:row-reverse;margin-right:5px}.ui-field[_ngcontent-%COMP%]   .header-container[_ngcontent-%COMP%]   .name-container[_ngcontent-%COMP%]   .edit-reference-capabilities-icon[_ngcontent-%COMP%] > .mat-icon[_ngcontent-%COMP%]{height:var(--%NS%apollo-icon-xs);width:var(--%NS%apollo-icon-xs);font-size:var(--%NS%apollo-icon-xs);display:block;padding:var(--%NS%apollo-pad-s);cursor:help;border:2px solid transparent;border-radius:50%;background:var(--%NS%color-background-secondary);border-color:var(--%NS%color-border-de-emp)}.ui-field[_ngcontent-%COMP%]   .header-container[_ngcontent-%COMP%]   .name-container[_ngcontent-%COMP%]   .edit-reference-capabilities-icon[_ngcontent-%COMP%] > .mat-icon[_ngcontent-%COMP%]:not(:first-child){margin-right:-5px}.ui-field[_ngcontent-%COMP%]   .header-container[_ngcontent-%COMP%]   .name-container[_ngcontent-%COMP%]   .edit-reference-capabilities-icon[_ngcontent-%COMP%] > .mat-icon[_ngcontent-%COMP%]:hover{transform:scale(1.1)}.ui-field[_ngcontent-%COMP%]   .header-container[_ngcontent-%COMP%]   .name-container[_ngcontent-%COMP%]   .field-name[_ngcontent-%COMP%]{margin-right:10px}.ui-field[_ngcontent-%COMP%]   .header-container[_ngcontent-%COMP%]   .name-container[_ngcontent-%COMP%]   .field-suggestion-count[_ngcontent-%COMP%]{margin-right:2px}.ui-field[_ngcontent-%COMP%]   .header-container[_ngcontent-%COMP%]   .tail-container[_ngcontent-%COMP%]{display:flex;align-items:center}.ui-field[_ngcontent-%COMP%]   .validator-notes[_ngcontent-%COMP%]{width:100%}.ui-field[_ngcontent-%COMP%]   .data-point[_ngcontent-%COMP%]{flex-grow:1}.ui-field[_ngcontent-%COMP%]   .data-point[_ngcontent-%COMP%]   .mat-mdc-card.field-card[_ngcontent-%COMP%]{width:100%;border:0 none;background-color:transparent}.ui-field[_ngcontent-%COMP%]   .data-point[_ngcontent-%COMP%]   .mat-mdc-card.field-card[_ngcontent-%COMP%] > .mat-mdc-card-content[_ngcontent-%COMP%]{padding:0}.ui-field[_ngcontent-%COMP%]   .data-point[_ngcontent-%COMP%]   .mat-mdc-card.field-card.field-suggestions-card[_ngcontent-%COMP%]{margin-top:-.5em;margin-left:4px;max-height:230px;overflow-y:auto;max-width:calc(100% - 39px);box-shadow:0 11px 15px -7px #0003,0 24px 38px 3px #00000024,0 9px 46px 8px #0000001f}.ui-field[_ngcontent-%COMP%]   .data-point[_ngcontent-%COMP%]   .manual-extraction-tools[_ngcontent-%COMP%]{display:flex;justify-content:flex-end;padding:0 4px}.ui-field[_ngcontent-%COMP%]   .mat-elevation-z0-custom[_ngcontent-%COMP%]{box-shadow:0 2px 1px #0003}.ui-field[_ngcontent-%COMP%]   .add-value[_ngcontent-%COMP%]{display:flex;justify-content:flex-end}`]})}return e})();var Va=[`fieldsContainer`];var dn=e=>({selectedThreshold:e});var La=(e,o)=>({notConfirmedFields:e,notConfirmedTables:o});var Aa=e=>({notConfirmedFields:e});var Ra=e=>({notConfirmedTables:e});var Vi=(e,o)=>o.id;function Da(e,o){if(e&1){let t=nt();E(0,`div`,2),Ne(1,`ui-du-vs-classic-confidence-switch`),E(2,`ui-threshold-picker`,5),B(3,`translate`),Q(`valueChange`,function(n){Ce(t);let a=F();return Se(a.onConfidenceThresholdChange(n))}),T()()}if(e&2){let t=F();x(2),K(`tooltip`,$(3,2,`VS_EXTRACTION_RESULTS_CONFIDENCE_THRESHOLD_TOOLTIP`))(`value`,t.confidenceThresholdValue())}}function Pa(e,o){if(e&1&&Ne(0,`ui-du-vs-classic-field`,6),e&2){let t=F(2);K(`field`,t.documentTypeField())(`readonly`,t.readonly()),ae(`data-field-id`,t.documentTypeField().id)}}function Fa(e,o){if(e&1&&Ne(0,`ui-du-vs-classic-field`,15),e&2){let t=o.$implicit,i=o.$index,n=F(3);K(`field`,t)(`readonly`,n.readonly()),ae(`data-testid`,`invalid_field_`+i+`_`+t.fieldId)(`data-field-id`,t.id)}}function za(e,o){if(e&1&&Vn$1(0,Fa,1,4,`ui-du-vs-classic-field`,15,Vi),e&2){let t=F(2);Bn$1(t.groupingFieldsService.invalidFields())}}function Ba(e,o){if(e&1&&Ne(0,`ui-du-vs-classic-field`,15),e&2){let t=o.$implicit,i=o.$index,n=F(3);K(`field`,t)(`readonly`,n.readonly()),ae(`data-testid`,`valid_field_`+i+`_`+t.fieldId)(`data-field-id`,t.id)}}function Ua(e,o){if(e&1&&Vn$1(0,Ba,1,4,`ui-du-vs-classic-field`,15,Vi),e&2){let t=F(2);Bn$1(t.groupingFieldsService.validFields())}}function Ha(e,o){if(e&1){let t=nt();ne(0,Pa,1,3,`ui-du-vs-classic-field`,6),E(1,`mat-accordion`,7)(2,`mat-expansion-panel`,8),Q(`opened`,function(){Ce(t);let n=F();return Se(n.invalidGroupExpanded.set(!0))})(`closed`,function(){Ce(t);let n=F();return Se(n.invalidGroupExpanded.set(!1))}),E(3,`mat-expansion-panel-header`,9),B(4,`translate`),E(5,`mat-panel-title`,10)(6,`span`),H(7),B(8,`translate`),T(),Ne(9,`ui-du-vs-classic-expand-icon`,11),T()(),bn(10,za,2,0,`ng-template`,12),T(),E(11,`mat-expansion-panel`,13),Q(`opened`,function(){Ce(t);let n=F();return Se(n.validGroupExpanded.set(!0))})(`closed`,function(){Ce(t);let n=F();return Se(n.validGroupExpanded.set(!1))}),E(12,`mat-expansion-panel-header`,14),B(13,`translate`),E(14,`mat-panel-title`,10)(15,`span`),H(16),B(17,`translate`),T(),Ne(18,`ui-du-vs-classic-expand-icon`,11),T()(),bn(19,Ua,2,0,`ng-template`,12),T()()}if(e&2){let t=F();ie(t.documentTypeField()?0:-1),x(2),K(`expanded`,t.invalidGroupExpanded()),x(),K(`matTooltip`,ro(4,11,t.invalidFieldsTooltip(),Wr(21,dn,t.confidenceThresholdValue()))),x(4),rc(``,$(8,14,`VS_EXTRACTION_RESULTS_INVALID_FIELDS_GROUP_TITLE`),` (`,t.groupingFieldsService.invalidFields().length,`)`),x(2),K(`expanded`,t.invalidGroupExpanded()),x(2),K(`expanded`,t.validGroupExpanded()),x(),K(`matTooltip`,ro(13,16,t.validFieldsTooltip(),Wr(23,dn,t.confidenceThresholdValue()))),x(4),rc(``,$(17,19,`VS_EXTRACTION_RESULTS_VALID_FIELDS_GROUP_TITLE`),` (`,t.groupingFieldsService.validFields().length,`)`),x(2),K(`expanded`,t.validGroupExpanded())}}function Xa(e,o){if(e&1&&Ne(0,`ui-du-vs-classic-field`,15),e&2){let t=o.$implicit,i=o.$index,n=F(2),a=t.fieldId===n.documentTypeTaxonomy()?.id,c=n.shouldHideDocumentTypeField()?i:i-1,d=a?`doc-type-field`:`field`+c;ge(`document-type-field`,a),K(`field`,t)(`readonly`,n.readonly()),ae(`data-testid`,d)(`data-field-id`,t.id)}}function ja(e,o){if(e&1&&Vn$1(0,Xa,1,6,`ui-du-vs-classic-field`,16,Vi),e&2){let t=F();Bn$1(t.fieldValuesToRender())}}function Ga(e,o){if(e&1){let t=nt();E(0,`button`,23),B(1,`translate`),B(2,`uiHotkeysComboDisplay`),Q(`click`,function(){Ce(t);let n=F(3);return Se(n.onDiscardChanges())}),H(3),B(4,`translate`),T()}if(e&2){let t,i=F(3);K(`matTooltip`,Oa$1(``,$(1,5,`VS_EXTRACTION_RESULTS_DISCARD_CHANGES_TOOLTIP`),` `,$(2,7,(t=i.discardChangesShortcut())==null?null:t.combos)))(`disabled`,!i.canDiscardChanges()),x(3),Xe(` `,$(4,9,`VS_EXTRACTION_RESULT_DISCARD_CHANGES_BUTTON`),` `)}}function Wa(e,o){e&1&&(E(0,`span`,25),H(1,`VS_EXTRACTION_RESULTS_MAIN_SAVEDRAFT_LOADING_STATE_BUTTON`),T())}function $a(e,o){e&1&&(E(0,`span`,25),H(1,`VS_EXTRACTION_RESULTS_MAIN_SAVEDRAFT_BUTTON`),T())}function Qa(e,o){if(e&1){let t=nt();E(0,`button`,24),B(1,`translate`),B(2,`uiHotkeysComboDisplay`),Q(`click`,function(){Ce(t);let n=F(3);return Se(n.onSave())}),ne(3,Wa,2,0,`span`,25)(4,$a,2,0,`span`,25),T()}if(e&2){let t,i=F(3),n=i.saveMode()===i.SavingState.ASDRAFT&&i.isSaving();K(`matTooltip`,Oa$1(``,$(1,6,`VS_EXTRACTION_RESULTS_MAIN_SAVEDRAFT_BUTTON_TOOLTIP`),` `,$(2,8,(t=i.saveAsDraftExtractionResultsShortcut())==null?null:t.combos)))(`disabled`,!i.canSave())(`progressButtonLoading`,n),x(3),ie(n?3:4)}}function qa(e,o){e&1&&(E(0,`span`,25),H(1,`VS_EXTRACTION_RESULTS_MAIN_SAVE_LOADING_STATE_BUTTON`),T())}function Ka(e,o){e&1&&(E(0,`span`,25),H(1,`VS_EXTRACTION_RESULTS_MAIN_SAVE_BUTTON`),T())}function Ya(e,o){if(e&1){let t=nt();qn$1(0),B(1,`translate`),B(2,`translate`),B(3,`uiHotkeysComboDisplay`),E(4,`div`)(5,`button`,26),Q(`click`,function(){Ce(t);let n=F(3);return Se(n.onSubmit())}),ne(6,qa,2,0,`span`,25)(7,Ka,2,0,`span`,25),T()()}if(e&2){let t,i=F(3),n=i.hasInvalidRules()?$(1,4,`VS_SAVE_BUSINESS_RULES_VALIDATION_ERROR`):$(2,6,`VS_EXTRACTION_RESULTS_MAIN_SAVE_BUTTON_TOOLTIP`)+` `+$(3,8,(t=i.saveExtractionResultsShortcut())==null?null:t.combos),a=i.saveMode()===i.SavingState.SUBMIT&&i.isSaving();x(5),K(`matTooltip`,n)(`disabled`,!i.canSave()||i.hasInvalidRules())(`progressButtonLoading`,a),x(),ie(a?6:7)}}function Za(e,o){if(e&1){let t=nt();E(0,`button`,27),B(1,`translate`),B(2,`uiHotkeysComboDisplay`),Q(`click`,function(){Ce(t);let n=F(3);return Se(n.onReportException())}),H(3,` ! `),T()}if(e&2){let t,i=F(3);K(`matTooltip`,Oa$1(``,$(1,4,`VS_EXTRACTION_RESULTS_REPORT_DOCUMENT_AS_EXCEPTION_TOOLTIP`),` `,$(2,6,(t=i.reportDocumentAsExceptionShortcut())==null?null:t.combos)))(`disabled`,i.isSaving()||i.isFormattingDerivedParts())}}function Ja(e,o){if(e&1&&(E(0,`div`,17),ne(1,Ga,5,11,`button`,19),E(2,`div`,20),ne(3,Qa,5,10,`button`,21),ne(4,Ya,8,10,`div`),T(),ne(5,Za,4,8,`button`,22),T()),e&2){let t=F(2);x(),ie(t.shouldHideDiscardButton()?-1:1),x(2),ie(t.enableSaveAsDraft()?3:-1),x(),ie(t.shouldHideSubmitButton()?-1:4),x(),ie(!t.shouldHideReportAsExceptionButton()&&t.isReportExceptionAllowed()?5:-1)}}function ts(e,o){if(e&1&&(H(0),B(1,`translate`)),e&2){let t=F(3);Xe(` `,ro(1,1,`VS_EXTRACTION_RESULTS_UNCONFIRMED_REGULAR_AND_TABLE_FIELDS_DECIDE_MESSAGE`,go(4,La,t.numberOfUnconfirmedRegularValues(),t.numberOfUnconfirmedTableValues())),` `)}}function is(e,o){if(e&1&&(H(0),B(1,`translate`)),e&2){let t=F(3);Xe(` `,ro(1,1,`VS_EXTRACTION_RESULTS_UNCONFIRMED_REGULAR_FIELDS_DECIDE_MESSAGE`,Wr(4,Aa,t.numberOfUnconfirmedRegularValues())),` `)}}function es(e,o){if(e&1&&(H(0),B(1,`translate`)),e&2){let t=F(3);Xe(` `,ro(1,1,`VS_EXTRACTION_RESULTS_UNCONFIRMED_TABLE_FIELDS_DECIDE_MESSAGE`,Wr(4,Ra,t.numberOfUnconfirmedTableValues())),` `)}}function ns(e,o){if(e&1){let t=nt();E(0,`div`,18)(1,`div`,28)(2,`span`),ne(3,ts,2,7)(4,is,2,6)(5,es,2,6),T(),E(6,`span`,25),H(7,` VS_EXTRACTION_RESULTS_UNCONFIRMED_FIELDS_CONTINUE_QUESTION `),T()(),E(8,`div`,29)(9,`button`,30),Q(`click`,function(){Ce(t);let n=F(2);return Se(n.onContinueAndSave())}),H(10),B(11,`translate`),T(),E(12,`button`,31),Q(`click`,function(){Ce(t);let n=F(2);return Se(n.onCancelDecisionMode())}),H(13),B(14,`translate`),T()()()}if(e&2){let t=F(2);x(3),ie(t.numberOfUnconfirmedRegularValues()>0&&t.numberOfUnconfirmedTableValues()>0?3:t.numberOfUnconfirmedRegularValues()>0?4:t.numberOfUnconfirmedTableValues()>0?5:-1),x(7),Xe(` `,$(11,3,`VS_EXTRACTION_RESULTS_CONTINUE_AND_SAVE_BUTTON`),` `),x(3),Xe(` `,$(14,5,`VS_EXTRACTION_RESULTS_NO_CONTINUE_BUTTON`),` `)}}function as(e,o){if(e&1&&(E(0,`div`,4),ne(1,Ja,6,4,`div`,17)(2,ns,15,7,`div`,18),T()),e&2){let t=F();x(),ie(t.isInDecidingMode()?2:1)}}function ss(e,o){e&1&&Ne(0,`ui-du-vs-readonly-footer`,32)}function ls(e,o){if(e&1&&ne(0,ss,1,0,`ui-du-vs-readonly-footer`,32),e&2){let t=F();ie(t.shouldHideReadonlyModeIndicator()?-1:0)}}var Ar=(()=>{class e extends ov{_stateService=p(jE);_injector=p(Ue);groupingFieldsService=p(Ei);_fieldsContainer=_i(`fieldsContainer`);_ignoreConfidence=this._featureFlagsService.enabledAsSignal(`fe-vs-ignore-confidence`);isConfidenceAllowed=P(()=>!this._ignoreConfidence());confidenceThresholdValue=P(()=>this._stateService.confidenceThreshold());documentTypeField=P(()=>{let t=this._extractionManagerService.selectedDocumentTypeId();return!t||this.shouldHideDocumentTypeField()?null:this._extractionManagerService.getById(t)});invalidGroupExpanded=me(!0);validGroupExpanded=me(!1);invalidFieldsTooltip=P(()=>this.groupingFieldsService.effectiveConfidenceThreshold()>0?`VS_EXTRACTION_RESULTS_INVALID_FIELDS_GROUP_TOOLTIP`:`VS_EXTRACTION_RESULTS_WITH_INVALID_RULES_FIELDS_GROUP_TOOLTIP`);validFieldsTooltip=P(()=>this.groupingFieldsService.effectiveConfidenceThreshold()>0?`VS_EXTRACTION_RESULTS_VALID_FIELDS_WITH_CONFIDENCE_GROUP_TOOLTIP`:`VS_EXTRACTION_RESULTS_VALID_FIELDS_GROUP_TOOLTIP`);_selectedFieldGroup=P(()=>this.groupingFieldsService.groupOf(this._selectedTopLevelFieldId()));_selectedTopLevelFieldId=P(()=>{let t=this._extractionManagerService.selectedValueId();if(!t)return null;let i=this._extractionManagerService.selectedDocumentTypeId();if(!i)return null;let n=t;for(let a=0;a<10;a++){let c=this._extractionManagerService.getById(n);if(!c)return null;if(c.parentId===i)return n;if(n=c.parentId,!n)return null}return null});constructor(){super(),At(()=>{if(this._stateService.confidenceThresholdSeeded)return;let t=this._configurationManagerService.customizationsStatus().loaded,i=this._configurationManagerService.globalCustomizations(),n=this.isConfidenceAllowed();t&&ot(()=>{if(!n)return;let a=i.fieldsValidationConfidence;if(a==null||a<=0)return;this._stateService.confidenceThresholdSeeded=!0;let c=Math.min(1,Math.max(0,a/100));this._stateService.confidenceThreshold.set(c)})}),At(()=>{let t=this._selectedFieldGroup();t===`invalid`?this.invalidGroupExpanded.set(!0):t===`valid`&&this.validGroupExpanded.set(!0)}),At(t=>{let i=this._selectedTopLevelFieldId();this._selectedFieldGroup(),i&&ot(()=>{let n=Rn$1(()=>this.scrollFieldIntoView(i),{injector:this._injector});t(()=>n.destroy())})})}scrollFieldIntoView(t){this._fieldsContainer()?.nativeElement?.querySelector(`[data-field-id="${t}"]`)?.scrollIntoView({block:`nearest`,inline:`nearest`})}onConfidenceThresholdChange(t){this._stateService.confidenceThreshold.set(t)}onSave(){this._extractionManagerService.removeEmptyTableRows(),super.onSave()}onSubmit(){this._extractionManagerService.removeEmptyTableRows(),super.onSubmit()}_navigationOrderedFieldValues(){let t=this.documentTypeField();return[...t?[t]:[],...this.groupingFieldsService.invalidFields(),...this.groupingFieldsService.validFields()]}static ɵfac=function(i){return new(i||e)};static ɵcmp=te({type:e,selectors:[[`ui-du-vs-classic-fields-form`]],viewQuery:function(i,n){i&1&&tr(n._fieldsContainer,Va,5),i&2&&nr()},features:[vt([Ei]),kt$1],decls:8,vars:3,consts:[[`fieldsContainer`,``],[`automation-id`,`fields-container`,`data-testid`,`fields-container`,1,`ui-fields-form`,3,`submit`],[`automation-id`,`confidence-filtering-container`,`data-testid`,`confidence-filtering-container`,1,`confidence-container`],[1,`fields`],[1,`footer`],[3,`valueChange`,`tooltip`,`value`],[`data-testid`,`doc-type-field`,1,`document-type-field`,3,`field`,`readonly`],[`multi`,`true`],[`hideToggle`,``,`data-testid`,`invalid-fields-group`,1,`fields-group-panel`,3,`opened`,`closed`,`expanded`],[`data-testid`,`invalid-fields-panel-header`,3,`matTooltip`],[1,`group-panel-title`],[3,`expanded`],[`matExpansionPanelContent`,``],[`hideToggle`,``,`data-testid`,`valid-fields-group`,1,`fields-group-panel`,3,`opened`,`closed`,`expanded`],[`data-testid`,`valid-fields-panel-header`,3,`matTooltip`],[3,`field`,`readonly`],[3,`document-type-field`,`field`,`readonly`],[1,`buttons`],[`data-testid`,`decide-unconfirmed-fields`,1,`decide-unconfirmed-fields`],[`mat-button`,``,`data-testid`,`btn-discard-changes`,1,`discard`,`btn-small`,3,`matTooltip`,`disabled`],[1,`save-buttons`],[`ui-progress-button`,``,`mat-stroked-button`,``,`color`,`secondary`,`data-testid`,`save-as-draft-button`,1,`save-as-draft`,`btn-small`,3,`matTooltip`,`disabled`,`progressButtonLoading`],[`mat-flat-button`,``,`data-testid`,`report-exception-button`,`color`,`warn`,1,`report`,`btn-small`,3,`matTooltip`,`disabled`],[`mat-button`,``,`data-testid`,`btn-discard-changes`,1,`discard`,`btn-small`,3,`click`,`matTooltip`,`disabled`],[`ui-progress-button`,``,`mat-stroked-button`,``,`color`,`secondary`,`data-testid`,`save-as-draft-button`,1,`save-as-draft`,`btn-small`,3,`click`,`matTooltip`,`disabled`,`progressButtonLoading`],[`translate`,``],[`ui-progress-button`,``,`mat-flat-button`,``,`color`,`primary`,`data-testid`,`save-button`,`type`,`button`,1,`save`,`btn-small`,3,`click`,`matTooltip`,`disabled`,`progressButtonLoading`],[`mat-flat-button`,``,`data-testid`,`report-exception-button`,`color`,`warn`,1,`report`,`btn-small`,3,`click`,`matTooltip`,`disabled`],[`data-testid`,`decide-message`,1,`decide-message`],[1,`decide-buttons`],[`mat-flat-button`,``,`color`,`primary`,`data-testid`,`continue-and-save`,1,`btn-small`,3,`click`],[`mat-flat-button`,``,`color`,`warn`,`data-testid`,`cancel-save`,1,`btn-small`,3,`click`],[1,`classic`]],template:function(i,n){i&1&&(E(0,`form`,1),Q(`submit`,function(c){return c.preventDefault()}),ne(1,Da,4,4,`div`,2),E(2,`div`,3,0),ne(4,Ha,20,25)(5,ja,2,0),T(),ne(6,as,3,1,`div`,4)(7,ls,1,1),T()),i&2&&(x(),ie(n.isConfidenceAllowed()?1:-1),x(3),ie(n.groupingFieldsService.isGroupingActive()?4:5),x(2),ie(n.readonly()?7:6))},dependencies:[Hn$1,ki$1,tr$1,Ru,qt,gn$1,er,xl,gr,Ci,Uf,pw,mw,Fe$1,an,Si,cn,Ua$1,wt,oU],styles:[`[_nghost-%COMP%]{height:100%}.ui-fields-form[_ngcontent-%COMP%]{height:100%;display:flex;flex-direction:column}.ui-fields-form[_ngcontent-%COMP%]   .confidence-container[_ngcontent-%COMP%]{display:flex;justify-content:space-between;padding-top:var(--%NS%apollo-pad-m);padding-bottom:var(--%NS%apollo-pad-m);white-space:nowrap;flex-wrap:wrap}.ui-fields-form[_ngcontent-%COMP%]   .confidence-container[_ngcontent-%COMP%]   ui-threshold-picker[_ngcontent-%COMP%]{margin-left:15px}.ui-fields-form[_ngcontent-%COMP%]   .fields[_ngcontent-%COMP%]{flex-grow:1;overflow-y:auto;background-color:var(--%NS%color-background-secondary);display:flex;flex-direction:column;gap:4px;scrollbar-gutter:stable}.ui-fields-form[_ngcontent-%COMP%]   .fields[_ngcontent-%COMP%]   .document-type-field[_ngcontent-%COMP%]{margin-bottom:12px}.ui-fields-form[_ngcontent-%COMP%]   .fields[_ngcontent-%COMP%]   .ui-alert-bar[_ngcontent-%COMP%]{margin:4px 4px 4px 8px}.ui-fields-form[_ngcontent-%COMP%]   .fields[_ngcontent-%COMP%]   .fields-group-panel[_ngcontent-%COMP%]{border-radius:0!important;box-shadow:none!important;border-top:1px solid var(--%NS%color-border)}.ui-fields-form[_ngcontent-%COMP%]   .fields[_ngcontent-%COMP%]   .fields-group-panel[_ngcontent-%COMP%]     .mat-expansion-panel-header{height:48px;background-color:var(--%NS%color-background-selected)!important;color:var(--%NS%color-foreground);font-weight:500;padding:0 16px}.ui-fields-form[_ngcontent-%COMP%]   .fields[_ngcontent-%COMP%]   .fields-group-panel[_ngcontent-%COMP%]     .mat-expansion-panel-header:hover{background-color:var(--%NS%color-background-hover)!important}.ui-fields-form[_ngcontent-%COMP%]   .fields[_ngcontent-%COMP%]   .fields-group-panel[_ngcontent-%COMP%]     .mat-expansion-panel-header .mat-expansion-panel-header-title{color:var(--%NS%color-foreground);margin-right:0}.ui-fields-form[_ngcontent-%COMP%]   .fields[_ngcontent-%COMP%]   .fields-group-panel[_ngcontent-%COMP%]     .mat-expansion-panel-body{padding:0}.ui-fields-form[_ngcontent-%COMP%]   .fields[_ngcontent-%COMP%]   .fields-group-panel[_ngcontent-%COMP%]     .mat-expansion-panel-content{font-size:inherit}.ui-fields-form[_ngcontent-%COMP%]   .fields[_ngcontent-%COMP%]   .fields-group-panel[_ngcontent-%COMP%]   .group-panel-title[_ngcontent-%COMP%]{display:flex;justify-content:center;align-items:center;width:100%}.ui-fields-form[_ngcontent-%COMP%]   .footer[_ngcontent-%COMP%]{display:flex;align-items:center;flex-wrap:wrap;border-top-width:1.2px;border-top-style:solid;border-top-color:var(--%NS%color-border);padding:10px 20px;color:var(--%NS%color-foreground)}.ui-fields-form[_ngcontent-%COMP%]   .footer[_ngcontent-%COMP%]   .ui-select[_ngcontent-%COMP%]   .mat-mdc-form-field[_ngcontent-%COMP%]{font-size:var(--%NS%apollo-font-m-size);max-width:85px}.ui-fields-form[_ngcontent-%COMP%]   .footer[_ngcontent-%COMP%]   .mat-icon[_ngcontent-%COMP%]{color:var(--%NS%color-foreground-secondary)}.ui-fields-form[_ngcontent-%COMP%]   .footer[_ngcontent-%COMP%]   .buttons[_ngcontent-%COMP%]{display:flex;flex-grow:1;justify-content:flex-end;gap:10px;align-items:center}.ui-fields-form[_ngcontent-%COMP%]   .footer[_ngcontent-%COMP%]   .buttons[_ngcontent-%COMP%]   .report[_ngcontent-%COMP%]{min-width:37px}.ui-fields-form[_ngcontent-%COMP%]   .footer[_ngcontent-%COMP%]   .buttons[_ngcontent-%COMP%]   .save-buttons[_ngcontent-%COMP%]{display:flex;gap:10px}.ui-fields-form[_ngcontent-%COMP%]   .footer[_ngcontent-%COMP%]   .buttons[_ngcontent-%COMP%]   .save-buttons[_ngcontent-%COMP%]   .save[_ngcontent-%COMP%], .ui-fields-form[_ngcontent-%COMP%]   .footer[_ngcontent-%COMP%]   .buttons[_ngcontent-%COMP%]   .save-buttons[_ngcontent-%COMP%]   .save-as-draft[_ngcontent-%COMP%]{min-width:95px}.ui-fields-form[_ngcontent-%COMP%]   .footer[_ngcontent-%COMP%]   .decide-unconfirmed-fields[_ngcontent-%COMP%]{display:flex;flex-wrap:nowrap;width:100%}.ui-fields-form[_ngcontent-%COMP%]   .footer[_ngcontent-%COMP%]   .decide-unconfirmed-fields[_ngcontent-%COMP%]   .decide-message[_ngcontent-%COMP%]{display:flex;flex-direction:column;flex-grow:1;align-items:flex-end;margin-right:20px;text-align:right;color:var(--%NS%color-foreground)}.ui-fields-form[_ngcontent-%COMP%]   .footer[_ngcontent-%COMP%]   .decide-unconfirmed-fields[_ngcontent-%COMP%]   .decide-message[_ngcontent-%COMP%] > span[_ngcontent-%COMP%]:first-child{font-size:var(--%NS%apollo-font-xs-size)}.ui-fields-form[_ngcontent-%COMP%]   .footer[_ngcontent-%COMP%]   .decide-unconfirmed-fields[_ngcontent-%COMP%]   .decide-message[_ngcontent-%COMP%] > span[_ngcontent-%COMP%]:nth-child(2){font-size:var(--%NS%apollo-font-s-size)}.ui-fields-form[_ngcontent-%COMP%]   .footer[_ngcontent-%COMP%]   .decide-unconfirmed-fields[_ngcontent-%COMP%]   .decide-buttons[_ngcontent-%COMP%]{display:flex;justify-content:flex-end;align-items:center}.ui-fields-form[_ngcontent-%COMP%]   .footer[_ngcontent-%COMP%]   .decide-unconfirmed-fields[_ngcontent-%COMP%]   .decide-buttons[_ngcontent-%COMP%]   .mat-icon[_ngcontent-%COMP%]{color:inherit}.ui-fields-form[_ngcontent-%COMP%]   .footer[_ngcontent-%COMP%]   .decide-unconfirmed-fields[_ngcontent-%COMP%]   .decide-buttons[_ngcontent-%COMP%]   .mat-mdc-unelevated-button[_ngcontent-%COMP%]:nth-child(2){margin-left:10px}.ui-fields-form[_ngcontent-%COMP%]   .footer[_ngcontent-%COMP%]   .discard[_ngcontent-%COMP%]{color:var(--%NS%color-foreground)}.ui-fields-form[_ngcontent-%COMP%]   .footer[_ngcontent-%COMP%]   .discard[disabled][_ngcontent-%COMP%]{color:var(--%NS%color-foreground-disable)}`]})}return e})();export{Ar as VsClassicFieldsFormComponent};