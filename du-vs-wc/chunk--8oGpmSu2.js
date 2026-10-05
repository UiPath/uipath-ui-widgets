import{d as y,f as z}from"./chunk-D4-ktzGU.js";import"./chunk-BSFMe_YW.js";import{$s as qn$1,Ai as YD,Al as ze,Bi as Zi$1,Cc as te,Ci as Xn$1,Cl as yt$1,Cr as Se,Dr as Sr,Ds as oh,Fc as um,Fi as Z,Fl as zv,Fn as Ne$1,Fs as pe,Gn as On$1,Gs as q,Gt as Jd,Ic as uo,Il as zy,In as No,K as Dt,Ka as fr,Kr as Ut,Lc as ur,Ln as Nr,Lr as U,Ml as zn$1,Ms as pGt,Mt as Hr,N as Ce$1,Na as ee,No as jm,O as C,Oi as Xx,Or as St,P as Ci,Pa as ei,Pc as ul,Pi as Yt,Po as jn$1,Qi as _x,Qs as qi$1,R as Cr,Rc as ut,Ro as k,Si as Xl,Sl as yn$1,Ta as du,Tl as z$1,Tn as Mo,Tr as Sn$1,Tt as H,Vc as va$1,Vo as ke$1,Vt as J,Wa as fi,Wi as Zt,Wr as Un$1,Xo as lo$1,Xt as Jt,Ya as gC,Yi as _n$1,Yn as P,Yr as V,Za as ge,Zr as VD,Zs as qe,_n as Ln$1,_o as id,_r as Rt$1,aa as ax,ao as he,ar as Qo,b as B,bi as Xe,bn as MM,bo as io$1,bs as nve,cc as ro$1,co as hm,da as bn,di as X,dt as Fe,ea as a_t,ec as qt,el as wi,fa as bo,fr as Re,gl as xr,gn as Ll,ho as iYt,ic as rR,is as me,j as Ca$1,ji as Ye,jo as jh,js as p,jt as Hn$1,k as CO,kc as tz,ko as je,kt as He,l as $s,la as be,m as AR,ml as xi,mr as Rn$1,n as $e,na as ae,ni as Vt,nr as QN,ns as ma$1,o as $n$1,oa as ay,oi as We,ol as wt,on as Ki$1,os as mn$1,pa as bt,pc as si,pl as xe,q as E,qc as vx,ra as an$1,ri as W,rl as wnt,sl as x6,so as hl,ts as m_e,tt as Et,u as $v,ul as xa$1,ur as R,v as Ao,vc as sx,vi as Xd,vs as ns,wa as ds,xa as de$1,xc as tZe,xl as ym,xs as nz,xt as Gh,y as Ar,yn as Lt,ys as nt,zc as v2,zn as O6}from"./chunk-B3xuZQ28.js";import{_ as Xr,a as Qo$1,b as ma$2,c as pe$1,d as Da$1,f as Ha$1,g as Vt$1,h as Ug,i as Ne$2,l as Ap,m as Ua$1,n as Dr,o as gr,p as Ia$1,r as Ge,s as ha$1,t as Be,u as Ba$1,v as _a$1,x as za$1,y as an$2}from"./main.js";var rn=[`knob`];var ln=[`valueIndicatorContainer`];function cn(i,r){if(i&1&&(E(0,`div`,2,1)(2,`div`,5)(3,`span`,6),H(4),k()()()),i&2){let t=P();C(4),$e(t.valueIndicatorText)}}var dn=[`trackActive`];var mn=[`*`];function _n(i,r){if(i&1&&Ne$1(0,`div`),i&2){let t=r.$implicit,e=r.$index,n=P(3);Rn$1(t===0?`mdc-slider__tick-mark--active`:`mdc-slider__tick-mark--inactive`),ur(`transform`,n._calcTickMarkTransform(e))}}function pn(i,r){if(i&1&&Hn$1(0,_n,1,4,`div`,8,jh),i&2)Un$1(P(2)._tickMarks)}function hn(i,r){if(i&1&&(E(0,`div`,6,1),ee(2,pn,2,0),k()),i&2){let t=P();C(2),te(t._cachedWidth?2:-1)}}function un(i,r){if(i&1&&Ne$1(0,`mat-slider-visual-thumb`,7),i&2){let t=P();W(`discrete`,t.discrete)(`thumbPosition`,1)(`valueIndicatorText`,t.startValueIndicatorText)}}var x=(function(i){return i[i.START=1]=`START`,i[i.END=2]=`END`,i})(x||{});var Ct=(function(i){return i[i.ACTIVE=0]=`ACTIVE`,i[i.INACTIVE=1]=`INACTIVE`,i})(Ct||{});var Ce=new Z(`_MatSlider`);var Hi=new Z(`_MatSliderThumb`);var gn=new Z(`_MatSliderRangeThumb`);var ji=new Z(`_MatSliderVisualThumb`);var fn=(()=>{class i{_cdr=p(ut);_ngZone=p(We);_slider=p(Ce);_renderer=p(Zt);_listenerCleanups;discrete=!1;thumbPosition;valueIndicatorText;_ripple;_knob;_valueIndicatorContainer;_sliderInput;_sliderInputEl;_hoverRippleRef;_focusRippleRef;_activeRippleRef;_isHovered=!1;_isActive=!1;_isValueIndicatorVisible=!1;_hostElement=p(ke$1).nativeElement;_platform=p(_n$1);ngAfterViewInit(){let t=this._slider._getInput(this.thumbPosition);t&&(this._ripple.radius=24,this._sliderInput=t,this._sliderInputEl=this._sliderInput._hostElement,this._ngZone.runOutsideAngular(()=>{let e=this._sliderInputEl,n=this._renderer;this._listenerCleanups=[n.listen(e,`pointermove`,this._onPointerMove),n.listen(e,`pointerdown`,this._onDragStart),n.listen(e,`pointerup`,this._onDragEnd),n.listen(e,`pointerleave`,this._onMouseLeave),n.listen(e,`focus`,this._onFocus),n.listen(e,`blur`,this._onBlur)]}))}ngOnDestroy(){this._listenerCleanups?.forEach(t=>t())}_onPointerMove=t=>{if(this._sliderInput._isFocused)return;let e=this._hostElement.getBoundingClientRect(),n=this._slider._isCursorOnSliderThumb(t,e);this._isHovered=n,n?this._showHoverRipple():this._hideRipple(this._hoverRippleRef)};_onMouseLeave=()=>{this._isHovered=!1,this._hideRipple(this._hoverRippleRef)};_onFocus=()=>{this._hideRipple(this._hoverRippleRef),this._showFocusRipple(),this._hostElement.classList.add(`mdc-slider__thumb--focused`)};_onBlur=()=>{this._isActive||this._hideRipple(this._focusRippleRef),this._isHovered&&this._showHoverRipple(),this._hostElement.classList.remove(`mdc-slider__thumb--focused`)};_onDragStart=t=>{t.button===0&&(this._isActive=!0,this._showActiveRipple())};_onDragEnd=()=>{this._isActive=!1,this._hideRipple(this._activeRippleRef),this._sliderInput._isFocused||this._hideRipple(this._focusRippleRef),this._platform.SAFARI&&this._showHoverRipple()};_showHoverRipple(){this._isShowingRipple(this._hoverRippleRef)||(this._hoverRippleRef=this._showRipple({enterDuration:0,exitDuration:0}),this._hoverRippleRef?.element.classList.add(`mat-mdc-slider-hover-ripple`))}_showFocusRipple(){this._isShowingRipple(this._focusRippleRef)||(this._focusRippleRef=this._showRipple({enterDuration:0,exitDuration:0},!0),this._focusRippleRef?.element.classList.add(`mat-mdc-slider-focus-ripple`))}_showActiveRipple(){this._isShowingRipple(this._activeRippleRef)||(this._activeRippleRef=this._showRipple({enterDuration:225,exitDuration:400}),this._activeRippleRef?.element.classList.add(`mat-mdc-slider-active-ripple`))}_isShowingRipple(t){return t?.state===Ca$1.FADING_IN||t?.state===Ca$1.VISIBLE}_showRipple(t,e){if(!this._slider.disabled&&(this._showValueIndicator(),this._slider._isRange&&this._slider._getThumb(this.thumbPosition===x.START?x.END:x.START)._showValueIndicator(),!(this._slider._globalRippleOptions?.disabled&&!e)))return this._ripple.launch({animation:this._slider._noopAnimations?{enterDuration:0,exitDuration:0}:t,centered:!0,persistent:!0})}_hideRipple(t){if(t?.fadeOut(),this._isShowingAnyRipple())return;this._slider._isRange||this._hideValueIndicator();let e=this._getSibling();e._isShowingAnyRipple()||(this._hideValueIndicator(),e._hideValueIndicator())}_showValueIndicator(){this._hostElement.classList.add(`mdc-slider__thumb--with-indicator`)}_hideValueIndicator(){this._hostElement.classList.remove(`mdc-slider__thumb--with-indicator`)}_getSibling(){return this._slider._getThumb(this.thumbPosition===x.START?x.END:x.START)}_getValueIndicatorContainer(){return this._valueIndicatorContainer?.nativeElement}_getKnob(){return this._knob.nativeElement}_isShowingAnyRipple(){return this._isShowingRipple(this._hoverRippleRef)||this._isShowingRipple(this._focusRippleRef)||this._isShowingRipple(this._activeRippleRef)}static ɵfac=function(e){return new(e||i)};static ɵcmp=J({type:i,selectors:[[`mat-slider-visual-thumb`]],viewQuery:function(e,n){if(e&1&&an$1(xa$1,5)(rn,5)(ln,5),e&2){let a;ze(a=je())&&(n._ripple=a.first),ze(a=je())&&(n._knob=a.first),ze(a=je())&&(n._valueIndicatorContainer=a.first)}},hostAttrs:[1,`mdc-slider__thumb`,`mat-mdc-slider-visual-thumb`],inputs:{discrete:`discrete`,thumbPosition:`thumbPosition`,valueIndicatorText:`valueIndicatorText`},features:[bt([{provide:ji,useExisting:i}])],decls:4,vars:2,consts:[[`knob`,``],[`valueIndicatorContainer`,``],[1,`mdc-slider__value-indicator-container`],[1,`mdc-slider__thumb-knob`],[`matRipple`,``,1,`mat-focus-indicator`,3,`matRippleDisabled`],[1,`mdc-slider__value-indicator`],[1,`mdc-slider__value-indicator-text`]],template:function(e,n){e&1&&(ee(0,cn,5,1,`div`,2),Ne$1(1,`div`,3,0)(3,`div`,4)),e&2&&(te(n.discrete?0:-1),C(3),W(`matRippleDisabled`,!0))},dependencies:[xa$1],styles:[`.mat-mdc-slider-visual-thumb .mat-ripple {
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
`],encapsulation:2})}return i})();var Wi=(()=>{class i{_ngZone=p(We);_cdr=p(ut);_elementRef=p(ke$1);_dir=p(si,{optional:!0});_globalRippleOptions=p(hm,{optional:!0});_trackActive;_thumbs;_input;_inputs;get disabled(){return this._disabled}set disabled(t){this._disabled=t;let e=this._getInput(x.END),n=this._getInput(x.START);e&&(e.disabled=this._disabled),n&&(n.disabled=this._disabled)}_disabled=!1;get discrete(){return this._discrete}set discrete(t){this._discrete=t,this._updateValueIndicatorUIs()}_discrete=!1;get showTickMarks(){return this._showTickMarks}set showTickMarks(t){this._showTickMarks=t,this._hasViewInitialized&&(this._updateTickMarkUI(),this._updateTickMarkTrackUI())}_showTickMarks=!1;get min(){return this._min}set min(t){let e=t==null||isNaN(t)?this._min:t;this._min!==e&&this._updateMin(e)}_min=0;color;disableRipple=!1;_updateMin(t){let e=this._min;this._min=t,this._isRange?this._updateMinRange({old:e,new:t}):this._updateMinNonRange(t),this._onMinMaxOrStepChange()}_updateMinRange(t){let e=this._getInput(x.END),n=this._getInput(x.START),a=e.value,d=n.value;n.min=t.new,e.min=Math.max(t.new,n.value),n.max=Math.min(e.max,e.value),n._updateWidthInactive(),e._updateWidthInactive(),t.new<t.old?this._onTranslateXChangeBySideEffect(e,n):this._onTranslateXChangeBySideEffect(n,e),a!==e.value&&this._onValueChange(e),d!==n.value&&this._onValueChange(n)}_updateMinNonRange(t){let e=this._getInput(x.END);if(e){let n=e.value;e.min=t,e._updateThumbUIByValue(),this._updateTrackUI(e),n!==e.value&&this._onValueChange(e)}}get max(){return this._max}set max(t){let e=t==null||isNaN(t)?this._max:t;this._max!==e&&this._updateMax(e)}_max=100;_updateMax(t){let e=this._max;this._max=t,this._isRange?this._updateMaxRange({old:e,new:t}):this._updateMaxNonRange(t),this._onMinMaxOrStepChange()}_updateMaxRange(t){let e=this._getInput(x.END),n=this._getInput(x.START),a=e.value,d=n.value;e.max=t.new,n.max=Math.min(t.new,e.value),e.min=n.value,e._updateWidthInactive(),n._updateWidthInactive(),t.new>t.old?this._onTranslateXChangeBySideEffect(n,e):this._onTranslateXChangeBySideEffect(e,n),a!==e.value&&this._onValueChange(e),d!==n.value&&this._onValueChange(n)}_updateMaxNonRange(t){let e=this._getInput(x.END);if(e){let n=e.value;e.max=t,e._updateThumbUIByValue(),this._updateTrackUI(e),n!==e.value&&this._onValueChange(e)}}get step(){return this._step}set step(t){let e=isNaN(t)?this._step:t;this._step!==e&&this._updateStep(e)}_step=1;_updateStep(t){this._step=t,this._isRange?this._updateStepRange():this._updateStepNonRange(),this._onMinMaxOrStepChange()}_updateStepRange(){let t=this._getInput(x.END),e=this._getInput(x.START),n=t.value,a=e.value,d=e.value;t.min=this._min,e.max=this._max,t.step=this._step,e.step=this._step,this._platform.SAFARI&&(t.value=t.value,e.value=e.value),t.min=Math.max(this._min,e.value),e.max=Math.min(this._max,t.value),e._updateWidthInactive(),t._updateWidthInactive(),t.value<d?this._onTranslateXChangeBySideEffect(e,t):this._onTranslateXChangeBySideEffect(t,e),n!==t.value&&this._onValueChange(t),a!==e.value&&this._onValueChange(e)}_updateStepNonRange(){let t=this._getInput(x.END);if(t){let e=t.value;t.step=this._step,this._platform.SAFARI&&(t.value=t.value),t._updateThumbUIByValue(),e!==t.value&&this._onValueChange(t)}}displayWith=t=>`${t}`;_tickMarks;_noopAnimations=yn$1();_resizeObserver=null;_cachedWidth;_cachedLeft;_rippleRadius=24;startValueIndicatorText=``;endValueIndicatorText=``;_endThumbTransform;_startThumbTransform;_isRange=!1;_isRtl=z$1(()=>this._dir?.valueSignal()===`rtl`);_hasViewInitialized=!1;_tickMarkTrackWidth=0;_hasAnimation=!1;_resizeTimer=null;_platform=p(_n$1);constructor(){p(Sn$1).load(Cr);let t=this._isRtl();Gh(()=>{let e=this._isRtl();e!==t&&(t=e,this._isRange?this._onDirChangeRange():this._onDirChangeNonRange(),this._updateTickMarkUI())})}_knobRadius=8;_inputPadding;ngAfterViewInit(){this._platform.isBrowser&&this._updateDimensions();let t=this._getInput(x.END),e=this._getInput(x.START);this._isRange=!!t&&!!e,this._cdr.detectChanges();let n=this._getThumb(x.END);this._rippleRadius=n._ripple.radius,this._inputPadding=this._rippleRadius-this._knobRadius,this._isRange?this._initUIRange(t,e):this._initUINonRange(t),this._updateTrackUI(t),this._updateTickMarkUI(),this._updateTickMarkTrackUI(),this._observeHostResize(),this._cdr.detectChanges()}_initUINonRange(t){t.initProps(),t.initUI(),this._updateValueIndicatorUI(t),this._hasViewInitialized=!0,t._updateThumbUIByValue()}_initUIRange(t,e){t.initProps(),t.initUI(),e.initProps(),e.initUI(),t._updateMinMax(),e._updateMinMax(),t._updateStaticStyles(),e._updateStaticStyles(),this._updateValueIndicatorUIs(),this._hasViewInitialized=!0,t._updateThumbUIByValue(),e._updateThumbUIByValue()}ngOnDestroy(){this._resizeObserver?.disconnect(),this._resizeObserver=null}_onDirChangeRange(){let t=this._getInput(x.END),e=this._getInput(x.START);t._setIsLeftThumb(),e._setIsLeftThumb(),t.translateX=t._calcTranslateXByValue(),e.translateX=e._calcTranslateXByValue(),t._updateStaticStyles(),e._updateStaticStyles(),t._updateWidthInactive(),e._updateWidthInactive(),t._updateThumbUIByValue(),e._updateThumbUIByValue()}_onDirChangeNonRange(){this._getInput(x.END)._updateThumbUIByValue()}_observeHostResize(){typeof ResizeObserver>`u`||!ResizeObserver||this._ngZone.runOutsideAngular(()=>{this._resizeObserver=new ResizeObserver(()=>{this._isActive()||(this._resizeTimer&&clearTimeout(this._resizeTimer),this._onResize())}),this._resizeObserver.observe(this._elementRef.nativeElement)})}_isActive(){return this._getThumb(x.START)._isActive||this._getThumb(x.END)._isActive}_getValue(t=x.END){let e=this._getInput(t);return e?e.value:this.min}_skipUpdate(){return!!(this._getInput(x.START)?._skipUIUpdate||this._getInput(x.END)?._skipUIUpdate)}_updateDimensions(){this._cachedWidth=this._elementRef.nativeElement.offsetWidth,this._cachedLeft=this._elementRef.nativeElement.getBoundingClientRect().left}_setTrackActiveStyles(t){let e=this._trackActive.nativeElement.style;e.left=t.left,e.right=t.right,e.transformOrigin=t.transformOrigin,e.transform=t.transform}_calcTickMarkTransform(t){let e=t*(this._tickMarkTrackWidth/(this._tickMarks.length-1));return`translateX(${this._isRtl()?this._cachedWidth-6-e:e}px)`}_onTranslateXChange(t){this._hasViewInitialized&&(this._updateThumbUI(t),this._updateTrackUI(t),this._updateOverlappingThumbUI(t))}_onTranslateXChangeBySideEffect(t,e){this._hasViewInitialized&&(t._updateThumbUIByValue(),e._updateThumbUIByValue())}_onValueChange(t){this._hasViewInitialized&&(this._updateValueIndicatorUI(t),this._updateTickMarkUI(),this._cdr.detectChanges())}_onMinMaxOrStepChange(){this._hasViewInitialized&&(this._updateTickMarkUI(),this._updateTickMarkTrackUI(),this._cdr.markForCheck())}_onResize(){if(this._hasViewInitialized){if(this._updateDimensions(),this._isRange){let t=this._getInput(x.END),e=this._getInput(x.START);t._updateThumbUIByValue(),e._updateThumbUIByValue(),t._updateStaticStyles(),e._updateStaticStyles(),t._updateMinMax(),e._updateMinMax(),t._updateWidthInactive(),e._updateWidthInactive()}else{let t=this._getInput(x.END);t&&t._updateThumbUIByValue()}this._updateTickMarkUI(),this._updateTickMarkTrackUI(),this._cdr.detectChanges()}}_thumbsOverlap=!1;_areThumbsOverlapping(){let t=this._getInput(x.START),e=this._getInput(x.END);return!t||!e?!1:e.translateX-t.translateX<20}_updateOverlappingThumbClassNames(t){let e=t.getSibling(),n=this._getThumb(t.thumbPosition);this._getThumb(e.thumbPosition)._hostElement.classList.remove(`mdc-slider__thumb--top`),n._hostElement.classList.toggle(`mdc-slider__thumb--top`,this._thumbsOverlap)}_updateOverlappingThumbUI(t){!this._isRange||this._skipUpdate()||this._thumbsOverlap!==this._areThumbsOverlapping()&&(this._thumbsOverlap=!this._thumbsOverlap,this._updateOverlappingThumbClassNames(t))}_updateThumbUI(t){if(this._skipUpdate())return;let e=this._getThumb(t.thumbPosition===x.END?x.END:x.START);e._hostElement.style.transform=`translateX(${t.translateX}px)`}_updateValueIndicatorUI(t){if(this._skipUpdate())return;let e=this.displayWith(t.value);if(this._hasViewInitialized?t._valuetext.set(e):t._hostElement.setAttribute(`aria-valuetext`,e),this.discrete){t.thumbPosition===x.START?this.startValueIndicatorText=e:this.endValueIndicatorText=e;let n=this._getThumb(t.thumbPosition);e.length<3?n._hostElement.classList.add(`mdc-slider__thumb--short-value`):n._hostElement.classList.remove(`mdc-slider__thumb--short-value`)}}_updateValueIndicatorUIs(){let t=this._getInput(x.END),e=this._getInput(x.START);t&&this._updateValueIndicatorUI(t),e&&this._updateValueIndicatorUI(e)}_updateTickMarkTrackUI(){if(!this.showTickMarks||this._skipUpdate())return;let t=this._step&&this._step>0?this._step:1,n=(Math.floor(this.max/t)*t-this.min)/(this.max-this.min);this._tickMarkTrackWidth=(this._cachedWidth-6)*n}_updateTrackUI(t){this._skipUpdate()||(this._isRange?this._updateTrackUIRange(t):this._updateTrackUINonRange(t))}_updateTrackUIRange(t){let e=t.getSibling();if(!e||!this._cachedWidth)return;let n=Math.abs(e.translateX-t.translateX)/this._cachedWidth;t._isLeftThumb&&this._cachedWidth?this._setTrackActiveStyles({left:`auto`,right:`${this._cachedWidth-e.translateX}px`,transformOrigin:`right`,transform:`scaleX(${n})`}):this._setTrackActiveStyles({left:`${e.translateX}px`,right:`auto`,transformOrigin:`left`,transform:`scaleX(${n})`})}_updateTrackUINonRange(t){this._isRtl()?this._setTrackActiveStyles({left:`auto`,right:`0px`,transformOrigin:`right`,transform:`scaleX(${1-t.fillPercentage})`}):this._setTrackActiveStyles({left:`0px`,right:`auto`,transformOrigin:`left`,transform:`scaleX(${t.fillPercentage})`})}_updateTickMarkUI(){if(!this.showTickMarks||this.step===void 0||this.min===void 0||this.max===void 0)return;let t=this.step>0?this.step:1;this._isRange?this._updateTickMarkUIRange(t):this._updateTickMarkUINonRange(t)}_updateTickMarkUINonRange(t){let e=this._getValue(),n=Math.max(Math.round((e-this.min)/t),0)+1,a=Math.max(Math.round((this.max-e)/t),0)-1;this._isRtl()?n++:a++,this._tickMarks=Array(n).fill(Ct.ACTIVE).concat(Array(a).fill(Ct.INACTIVE))}_updateTickMarkUIRange(t){let e=this._getValue(),n=this._getValue(x.START),a=Math.max(Math.round((n-this.min)/t),0),d=Math.max(Math.round((e-n)/t)+1,0),u=Math.max(Math.round((this.max-e)/t),0);this._tickMarks=Array(a).fill(Ct.INACTIVE).concat(Array(d).fill(Ct.ACTIVE),Array(u).fill(Ct.INACTIVE))}_getInput(t){if(t===x.END&&this._input)return this._input;if(this._inputs?.length)return t===x.START?this._inputs.first:this._inputs.last}_getThumb(t){return t===x.END?this._thumbs?.last:this._thumbs?.first}_setTransition(t){this._hasAnimation=!this._platform.IOS&&t&&!this._noopAnimations,this._elementRef.nativeElement.classList.toggle(`mat-mdc-slider-with-animation`,this._hasAnimation)}_isCursorOnSliderThumb(t,e){let n=e.width/2,a=e.x+n,d=e.y+n,u=t.clientX-a,S=t.clientY-d;return Math.pow(u,2)+Math.pow(S,2)<Math.pow(n,2)}static ɵfac=function(e){return new(e||i)};static ɵcmp=J({type:i,selectors:[[`mat-slider`]],contentQueries:function(e,n,a){if(e&1&&Ki$1(a,Hi,5)(a,gn,4),e&2){let d;ze(d=je())&&(n._input=d.first),ze(d=je())&&(n._inputs=d)}},viewQuery:function(e,n){if(e&1&&an$1(dn,5)(ji,5),e&2){let a;ze(a=je())&&(n._trackActive=a.first),ze(a=je())&&(n._thumbs=a)}},hostAttrs:[1,`mat-mdc-slider`,`mdc-slider`],hostVars:12,hostBindings:function(e,n){e&2&&(Rn$1(`mat-`+(n.color||`primary`)),ge(`mdc-slider--range`,n._isRange)(`mdc-slider--disabled`,n.disabled)(`mdc-slider--discrete`,n.discrete)(`mdc-slider--tick-marks`,n.showTickMarks)(`_mat-animation-noopable`,n._noopAnimations))},inputs:{disabled:[2,`disabled`,`disabled`,be],discrete:[2,`discrete`,`discrete`,be],showTickMarks:[2,`showTickMarks`,`showTickMarks`,be],min:[2,`min`,`min`,qi$1],color:`color`,disableRipple:[2,`disableRipple`,`disableRipple`,be],max:[2,`max`,`max`,qi$1],step:[2,`step`,`step`,qi$1],displayWith:`displayWith`},exportAs:[`matSlider`],features:[bt([{provide:Ce,useExisting:i}])],ngContentSelectors:mn,decls:9,vars:5,consts:[[`trackActive`,``],[`tickMarkContainer`,``],[1,`mdc-slider__track`],[1,`mdc-slider__track--inactive`],[1,`mdc-slider__track--active`],[1,`mdc-slider__track--active_fill`],[1,`mdc-slider__tick-marks`],[3,`discrete`,`thumbPosition`,`valueIndicatorText`],[3,`class`,`transform`]],template:function(e,n){e&1&&(Rt$1(),Ye(0),E(1,`div`,2),Ne$1(2,`div`,3),E(3,`div`,4),Ne$1(4,`div`,5,0),k(),ee(6,hn,3,1,`div`,6),k(),ee(7,un,1,3,`mat-slider-visual-thumb`,7),Ne$1(8,`mat-slider-visual-thumb`,7)),e&2&&(C(6),te(n.showTickMarks?6:-1),C(),te(n._isRange?7:-1),C(),W(`discrete`,n.discrete)(`thumbPosition`,2)(`valueIndicatorText`,n.endValueIndicatorText))},dependencies:[fn],styles:[`.mdc-slider__track {
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
`],encapsulation:2})}return i})();var vn={provide:lo$1,useExisting:fi(()=>yt),multi:!0};var yt=(()=>{class i{_ngZone=p(We);_elementRef=p(ke$1);_cdr=p(ut);_slider=p(Ce);_platform=p(_n$1);_listenerCleanups;get value(){return qi$1(this._hostElement.value,0)}set value(t){t===null&&(t=this._getDefaultValue()),t=isNaN(t)?0:t;let e=t+``;if(!this._hasSetInitialValue){this._initialValue=e;return}this._isActive||this._setValue(e)}_setValue(t){this._hostElement.value=t,this._updateThumbUIByValue(),this._slider._onValueChange(this),this._cdr.detectChanges(),this._slider._cdr.markForCheck()}valueChange=new me;dragStart=new me;dragEnd=new me;get translateX(){return this._slider.min>=this._slider.max?(this._translateX=this._tickMarkOffset,this._translateX):(this._translateX===void 0&&(this._translateX=this._calcTranslateXByValue()),this._translateX)}set translateX(t){this._translateX=t}_translateX;thumbPosition=x.END;get min(){return qi$1(this._hostElement.min,0)}set min(t){this._hostElement.min=t+``,this._cdr.detectChanges()}get max(){return qi$1(this._hostElement.max,0)}set max(t){this._hostElement.max=t+``,this._cdr.detectChanges()}get step(){return qi$1(this._hostElement.step,0)}set step(t){this._hostElement.step=t+``,this._cdr.detectChanges()}get disabled(){return be(this._hostElement.disabled)}set disabled(t){this._hostElement.disabled=t,this._cdr.detectChanges(),this._slider.disabled!==this.disabled&&(this._slider.disabled=this.disabled)}get percentage(){return this._slider.min>=this._slider.max?this._slider._isRtl()?1:0:(this.value-this._slider.min)/(this._slider.max-this._slider.min)}get fillPercentage(){return this._slider._cachedWidth?this._translateX===0?0:this.translateX/this._slider._cachedWidth:this._slider._isRtl()?1:0}_hostElement=this._elementRef.nativeElement;_valuetext=pe(``);_knobRadius=8;_tickMarkOffset=3;_isActive=!1;_isFocused=!1;_setIsFocused(t){this._isFocused=t}_hasSetInitialValue=!1;_initialValue;_formControl;_destroyed=new B;_skipUIUpdate=!1;_onChangeFn;_onTouchedFn=()=>{};_isControlInitialized=!1;constructor(){let t=p(Zt);this._ngZone.runOutsideAngular(()=>{this._listenerCleanups=[t.listen(this._hostElement,`pointerdown`,this._onPointerDown.bind(this)),t.listen(this._hostElement,`pointermove`,this._onPointerMove.bind(this)),t.listen(this._hostElement,`pointerup`,this._onPointerUp.bind(this))]})}ngOnDestroy(){this._listenerCleanups.forEach(t=>t()),this._destroyed.next(),this._destroyed.complete(),this.dragStart.complete(),this.dragEnd.complete()}initProps(){this._updateWidthInactive(),this.disabled!==this._slider.disabled&&(this._slider.disabled=!0),this.step=this._slider.step,this.min=this._slider.min,this.max=this._slider.max,this._initValue()}initUI(){this._updateThumbUIByValue()}_initValue(){this._hasSetInitialValue=!0,this._initialValue===void 0?this.value=this._getDefaultValue():(this._hostElement.value=this._initialValue,this._updateThumbUIByValue(),this._slider._onValueChange(this),this._cdr.detectChanges())}_getDefaultValue(){return this.min}_onBlur(){this._setIsFocused(!1),this._onTouchedFn()}_onFocus(){this._slider._setTransition(!1),this._slider._updateTrackUI(this),this._setIsFocused(!0)}_onChange(){this.valueChange.emit(this.value),this._isActive&&this._updateThumbUIByValue({withAnimation:!0})}_onInput(){this._onChangeFn?.(this.value),(this._slider.step||!this._isActive)&&this._updateThumbUIByValue({withAnimation:!this._isActive}),this._slider._onValueChange(this)}_onNgControlValueChange(){(!this._isActive||!this._isFocused)&&(this._slider._onValueChange(this),this._updateThumbUIByValue()),this._slider.disabled=this._formControl.disabled}_onPointerDown(t){if(!(this.disabled||t.button!==0)){if(this._platform.IOS){let e=this._slider._isCursorOnSliderThumb(t,this._slider._getThumb(this.thumbPosition)._hostElement.getBoundingClientRect());this._isActive=e,this._updateWidthActive(),this._slider._updateDimensions();return}this._isActive=!0,this._setIsFocused(!0),this._updateWidthActive(),this._slider._updateDimensions(),this._slider.step||this._updateThumbUIByPointerEvent(t,{withAnimation:!0}),this.disabled||(this._handleValueCorrection(t),this.dragStart.emit({source:this,parent:this._slider,value:this.value}))}}_handleValueCorrection(t){this._skipUIUpdate=!0,setTimeout(()=>{this._skipUIUpdate=!1,this._fixValue(t)},0)}_fixValue(t){let e=t.clientX-this._slider._cachedLeft,n=this._slider._cachedWidth,a=this._slider.step===0?1:this._slider.step,d=Math.floor((this._slider.max-this._slider.min)/a),u=this._slider._isRtl()?1-e/n:e/n,J=Math.round(u*d)/d*(this._slider.max-this._slider.min)+this._slider.min,tt=Math.round(J/a)*a;if(tt===this.value){this._slider._onValueChange(this),this._slider.step>0?this._updateThumbUIByValue():this._updateThumbUIByPointerEvent(t,{withAnimation:this._slider._hasAnimation});return}this.value=tt,this.valueChange.emit(this.value),this._onChangeFn?.(this.value),this._slider._onValueChange(this),this._slider.step>0?this._updateThumbUIByValue():this._updateThumbUIByPointerEvent(t,{withAnimation:this._slider._hasAnimation})}_onPointerMove(t){!this._slider.step&&this._isActive&&this._updateThumbUIByPointerEvent(t)}_onPointerUp(){this._isActive&&(this._isActive=!1,this._platform.SAFARI&&this._setIsFocused(!1),this.dragEnd.emit({source:this,parent:this._slider,value:this.value}),setTimeout(()=>this._updateWidthInactive(),this._platform.IOS?10:0))}_clamp(t){let e=this._tickMarkOffset,n=this._slider._cachedWidth-this._tickMarkOffset;return Math.max(Math.min(t,n),e)}_calcTranslateXByValue(){return this._slider._isRtl()?(1-this.percentage)*(this._slider._cachedWidth-this._tickMarkOffset*2)+this._tickMarkOffset:this.percentage*(this._slider._cachedWidth-this._tickMarkOffset*2)+this._tickMarkOffset}_calcTranslateXByPointerEvent(t){return t.clientX-this._slider._cachedLeft}_updateWidthActive(){}_updateWidthInactive(){this._hostElement.style.padding=`0 ${this._slider._inputPadding}px`,this._hostElement.style.width=`calc(100% + ${this._slider._inputPadding-this._tickMarkOffset*2}px)`,this._hostElement.style.left=`-${this._slider._rippleRadius-this._tickMarkOffset}px`}_updateThumbUIByValue(t){this.translateX=this._clamp(this._calcTranslateXByValue()),this._updateThumbUI(t)}_updateThumbUIByPointerEvent(t,e){this.translateX=this._clamp(this._calcTranslateXByPointerEvent(t)),this._updateThumbUI(e)}_updateThumbUI(t){this._slider._setTransition(!!t?.withAnimation),this._slider._onTranslateXChange(this)}writeValue(t){(this._isControlInitialized||t!==null)&&(this.value=t)}registerOnChange(t){this._onChangeFn=t,this._isControlInitialized=!0}registerOnTouched(t){this._onTouchedFn=t}setDisabledState(t){this.disabled=t}focus(){this._hostElement.focus()}blur(){this._hostElement.blur()}static ɵfac=function(e){return new(e||i)};static ɵdir=he({type:i,selectors:[[`input`,`matSliderThumb`,``]],hostAttrs:[`type`,`range`,1,`mdc-slider__input`],hostVars:1,hostBindings:function(e,n){e&1&&X(`change`,function(){return n._onChange()})(`input`,function(){return n._onInput()})(`blur`,function(){return n._onBlur()})(`focus`,function(){return n._onFocus()}),e&2&&ae(`aria-valuetext`,n._valuetext())},inputs:{value:[2,`value`,`value`,qi$1]},outputs:{valueChange:`valueChange`,dragStart:`dragStart`,dragEnd:`dragEnd`},exportAs:[`matSliderThumb`],features:[bt([vn,{provide:Hi,useExisting:i}])]})}return i})();var Gi=(()=>{class i{static ɵfac=function(e){return new(e||i)};static ɵmod=Fe({type:i});static ɵinj=Re({imports:[ds,Vt]})}return i})();function Cn(i,r){if(i&1&&(E(0,`div`,4),H(1),k()),i&2){let t=P();C(),qe(` 0% - `,t.viewValue(),`% `)}}var ye=0;var yn=0;var Sn=100;var $i=100;var kn=15;var Tn=75;var wn=100;var ke=(()=>{class i{tooltip=de$1(``);value=de$1();valueChange=Yt();menuTrigger=Ci(ax);slider=Ci(yt);viewValue=pe(ye);isConfidenceSet=pe(!1);hideLowerLimitLabel=pe(!0);hideUpperLimitLabel=pe(!1);constructor(){Ut(()=>{let t=this.value();t!=null&&t!==void 0&&this._setViewValue(t)}),Ut(t=>{let e=this.menuTrigger();if(!e)return;let n=e.menuOpened.pipe(v2(wn)).subscribe(()=>{this.slider()?.focus(),this.toggleLimits(this.viewValue())});t(()=>n.unsubscribe())})}formatLabel(t){return t+`%`}toggleLimits(t){this.hideLowerLimitLabel.set(t<kn),this.hideUpperLimitLabel.set(t>Tn)}sliderValueChanged(t){this.isConfidenceSet.set(!0),this.viewValue.set(Math.round(t)),this.valueChange.emit(t/$i)}resetConfidence(){this.viewValue.set(ye),this.toggleLimits(ye),this.isConfidenceSet.set(!1),this.valueChange.emit(void 0),this.menuTrigger()?.closeMenu()}_setViewValue(t){let e=Math.min(Sn,Math.max(yn,t*$i));this.isConfidenceSet.set(!0),this.viewValue.set(Math.round(e))}static ɵfac=function(e){return new(e||i)};static ɵcmp=J({type:i,selectors:[[`ui-threshold-picker`]],viewQuery:function(e,n){e&1&&Ar(n.menuTrigger,ax,5)(n.slider,yt,5),e&2&&Nr(2)},inputs:{tooltip:[1,`tooltip`],value:[1,`value`]},outputs:{valueChange:`valueChange`},decls:22,vars:14,consts:[[`menuTrigger`,`matMenuTrigger`],[`menu`,`matMenu`],[`ngSliderThumb`,`matSliderThumb`],[1,`ui-threshold-picker-container`],[`automation-id`,`threshold-picker-value`,`data-testid`,`threshold-picker-value`,1,`ui-threshold-picker-value`],[`automation-id`,`threshold-picker-button`,`data-testid`,`threshold-picker-button`,`mat-icon-button`,``,`color`,`primary`,1,`filter-button`,3,`matMenuTriggerFor`,`matTooltip`],[`xPosition`,`before`],[1,`ui-threshold-picker-slider-container`,3,`click`,`keydown`],[1,`limits-container`],[1,`limits`,3,`ngClass`],[1,`slider-container`],[`thumbLabel`,``,`discrete`,``,3,`keydown.enter`,`displayWith`],[`matSliderThumb`,``,`data-testid`,`threshold-picker-input`,3,`input`,`change`,`value`],[`color`,`primary`,`mat-button`,``,`data-testid`,`reset-confidence`,1,`btn-small`,3,`click`,`disabled`]],template:function(e,n){if(e&1){let a=nt();E(0,`div`,3),ee(1,Cn,2,1,`div`,4),E(2,`button`,5,0),V(4,`translate`),E(5,`mat-icon`),H(6,`filter_list`),k()(),E(7,`mat-menu`,6,1)(9,`div`,7),X(`click`,function(u){return u.stopPropagation()})(`keydown`,function(u){return u.stopPropagation()}),E(10,`div`,8)(11,`span`,9),H(12,`0%`),k(),E(13,`span`,9),H(14,`100%`),k()(),E(15,`div`,10)(16,`mat-slider`,11),X(`keydown.enter`,function(u){return Ce$1(a),zn$1(3).closeMenu(),xe(u.preventDefault())}),E(17,`input`,12,2),X(`input`,function(){Ce$1(a);let u=zn$1(18);return xe(n.toggleLimits(u.value))})(`change`,function(){Ce$1(a);let u=zn$1(18);return xe(n.sliderValueChanged(u.value))}),k()()(),E(19,`button`,13),X(`click`,function(){return n.resetConfidence()}),H(20),V(21,`translate`),k()()()()}if(e&2){let a=zn$1(8);C(),te(n.isConfidenceSet()?1:-1),C(),W(`matMenuTriggerFor`,a)(`matTooltip`,n.tooltip()),ae(`aria-label`,U(4,10,`A11Y_THRESHOLD_PICKER_FILTER_BUTTON`)),C(9),W(`ngClass`,n.hideLowerLimitLabel()?`transparent`:`opaque`),C(2),W(`ngClass`,n.hideUpperLimitLabel()?`transparent`:`opaque`),C(3),W(`displayWith`,n.formatLabel),C(),W(`value`,n.viewValue()),C(2),W(`disabled`,!n.isConfidenceSet()),C(),$e(U(21,12,`THRESHOLD_PICKER_RESET_CONFIDENCE`))}},dependencies:[Jt,Gi,Wi,yt,sx,du,ax,zy,On$1,xi,jn$1,xr,wi,Xn$1,bn,MM,Dt],styles:[`.ui-threshold-picker-container[_ngcontent-%COMP%]{font-size:var(--%NS%apollo-font-s-size);display:flex}.ui-threshold-picker-container[_ngcontent-%COMP%]   .ui-threshold-picker-value[_ngcontent-%COMP%]{margin:auto}.ui-threshold-picker-container[_ngcontent-%COMP%]   .filter-button[_ngcontent-%COMP%]{margin-right:10px;margin-left:5px}.ui-threshold-picker-slider-container[_ngcontent-%COMP%]{padding:var(--%NS%apollo-pad-xxl) var(--%NS%apollo-pad-xxxl) 5px}.ui-threshold-picker-slider-container[_ngcontent-%COMP%]   .limits-container[_ngcontent-%COMP%]{display:flex;justify-content:space-between}.ui-threshold-picker-slider-container[_ngcontent-%COMP%]   .limits-container[_ngcontent-%COMP%]   .limits[_ngcontent-%COMP%]{font-family:var(--%NS%apollo-font-normal);font-size:var(--%NS%apollo-font-m-size);font-weight:400;transition:opacity .2s ease-in-out}.ui-threshold-picker-slider-container[_ngcontent-%COMP%]   .limits-container[_ngcontent-%COMP%]   .limits.opaque[_ngcontent-%COMP%]{opacity:1}.ui-threshold-picker-slider-container[_ngcontent-%COMP%]   .limits-container[_ngcontent-%COMP%]   .limits.transparent[_ngcontent-%COMP%]{opacity:0}`]})}return i})();var Mn=[`*`];var In=`.mdc-list {
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
`;var Nn=[`unscopedContent`];var En=[`text`];var On=[[[``,`matListItemAvatar`,``],[``,`matListItemIcon`,``]],[[``,`matListItemTitle`,``]],[[``,`matListItemLine`,``]],`*`,[[``,`matListItemMeta`,``]],[[`mat-divider`]]];var Vn=[`[matListItemAvatar],[matListItemIcon]`,`[matListItemTitle]`,`[matListItemLine]`,`*`,`[matListItemMeta]`,`mat-divider`];var Rn=new Z(`ListOption`);var we=(()=>{class i{_elementRef=p(ke$1);static ɵfac=function(e){return new(e||i)};static ɵdir=he({type:i,selectors:[[``,`matListItemTitle`,``]],hostAttrs:[1,`mat-mdc-list-item-title`,`mdc-list-item__primary-text`]})}return i})();var Ln=(()=>{class i{_elementRef=p(ke$1);static ɵfac=function(e){return new(e||i)};static ɵdir=he({type:i,selectors:[[``,`matListItemLine`,``]],hostAttrs:[1,`mat-mdc-list-item-line`,`mdc-list-item__secondary-text`]})}return i})();var Me=(()=>{class i{static ɵfac=function(e){return new(e||i)};static ɵdir=he({type:i,selectors:[[``,`matListItemMeta`,``]],hostAttrs:[1,`mat-mdc-list-item-meta`,`mdc-list-item__end`]})}return i})();var Qi=(()=>{class i{_listOption=p(Rn,{optional:!0});_isAlignedAtStart(){return!this._listOption||this._listOption?._getTogglePosition()===`after`}static ɵfac=function(e){return new(e||i)};static ɵdir=he({type:i,hostVars:4,hostBindings:function(e,n){e&2&&ge(`mdc-list-item__start`,n._isAlignedAtStart())(`mdc-list-item__end`,!n._isAlignedAtStart())}})}return i})();var An=(()=>{class i extends Qi{static ɵfac=(()=>{let t;return function(n){return(t||(t=Et(i)))(n||i)}})();static ɵdir=he({type:i,selectors:[[``,`matListItemAvatar`,``]],hostAttrs:[1,`mat-mdc-list-item-avatar`],features:[wt]})}return i})();var Ie=(()=>{class i extends Qi{static ɵfac=(()=>{let t;return function(n){return(t||(t=Et(i)))(n||i)}})();static ɵdir=he({type:i,selectors:[[``,`matListItemIcon`,``]],hostAttrs:[1,`mat-mdc-list-item-icon`],features:[wt]})}return i})();var Pn=new Z(`MAT_LIST_CONFIG`);var Te=(()=>{class i{_isNonInteractive=!0;get disableRipple(){return this._disableRipple}set disableRipple(t){this._disableRipple=fr(t)}_disableRipple=!1;get disabled(){return this._disabled()}set disabled(t){this._disabled.set(fr(t))}_disabled=pe(!1);_defaultOptions=p(Pn,{optional:!0});static ɵfac=function(e){return new(e||i)};static ɵdir=he({type:i,hostVars:1,hostBindings:function(e,n){e&2&&ae(`aria-disabled`,n.disabled)},inputs:{disableRipple:`disableRipple`,disabled:`disabled`}})}return i})();var Dn=(()=>{class i{_elementRef=p(ke$1);_ngZone=p(We);_listBase=p(Te,{optional:!0});_platform=p(_n$1);_hostElement;_isButtonElement;_noopAnimations=yn$1();_avatars;_icons;set lines(t){this._explicitLines=Sr(t,null),this._updateItemLines(!1)}_explicitLines=null;get disableRipple(){return this.disabled||this._disableRipple||this._noopAnimations||!!this._listBase?.disableRipple}set disableRipple(t){this._disableRipple=fr(t)}_disableRipple=!1;get disabled(){return this._disabled()||!!this._listBase?.disabled}set disabled(t){this._disabled.set(fr(t))}_disabled=pe(!1);_subscriptions=new Lt;_rippleRenderer=null;_hasUnscopedTextContent=!1;rippleConfig;get rippleDisabled(){return this.disableRipple||!!this.rippleConfig.disabled}constructor(){p(Sn$1).load(Cr);let t=p(hm,{optional:!0});this.rippleConfig=t||{},this._hostElement=this._elementRef.nativeElement,this._isButtonElement=this._hostElement.nodeName.toLowerCase()===`button`,this._listBase&&!this._listBase._isNonInteractive&&this._initInteractiveListItem(),this._isButtonElement&&!this._hostElement.hasAttribute(`type`)&&this._hostElement.setAttribute(`type`,`button`)}ngAfterViewInit(){this._monitorProjectedLinesAndTitle(),this._updateItemLines(!0)}ngOnDestroy(){this._subscriptions.unsubscribe(),this._rippleRenderer!==null&&this._rippleRenderer._removeTriggerEvents()}_hasIconOrAvatar(){return!!(this._avatars.length||this._icons.length)}_initInteractiveListItem(){this._hostElement.classList.add(`mat-mdc-list-item-interactive`),this._rippleRenderer=new um(this,this._ngZone,this._hostElement,this._platform,p(Xe)),this._rippleRenderer.setupTriggerEvents(this._hostElement)}_monitorProjectedLinesAndTitle(){this._ngZone.runOutsideAngular(()=>{this._subscriptions.add(yt$1(this._lines.changes,this._titles.changes).subscribe(()=>this._updateItemLines(!1)))})}_updateItemLines(t){if(!this._lines||!this._titles||!this._unscopedContent)return;t&&this._checkDomForUnscopedTextContent();let e=this._explicitLines??this._inferLinesFromContent(),n=this._unscopedContent.nativeElement;if(this._hostElement.classList.toggle(`mat-mdc-list-item-single-line`,e<=1),this._hostElement.classList.toggle(`mdc-list-item--with-one-line`,e<=1),this._hostElement.classList.toggle(`mdc-list-item--with-two-lines`,e===2),this._hostElement.classList.toggle(`mdc-list-item--with-three-lines`,e===3),this._hasUnscopedTextContent){let a=this._titles.length===0&&e===1;n.classList.toggle(`mdc-list-item__primary-text`,a),n.classList.toggle(`mdc-list-item__secondary-text`,!a)}else n.classList.remove(`mdc-list-item__primary-text`),n.classList.remove(`mdc-list-item__secondary-text`)}_inferLinesFromContent(){let t=this._titles.length+this._lines.length;return this._hasUnscopedTextContent&&(t+=1),t}_checkDomForUnscopedTextContent(){this._hasUnscopedTextContent=Array.from(this._unscopedContent.nativeElement.childNodes).filter(t=>t.nodeType!==t.COMMENT_NODE).some(t=>!!(t.textContent&&t.textContent.trim()))}static ɵfac=function(e){return new(e||i)};static ɵdir=he({type:i,contentQueries:function(e,n,a){if(e&1&&Ki$1(a,An,4)(a,Ie,4),e&2){let d;ze(d=je())&&(n._avatars=d),ze(d=je())&&(n._icons=d)}},hostVars:4,hostBindings:function(e,n){e&2&&(ae(`aria-disabled`,n.disabled)(`disabled`,n._isButtonElement&&n.disabled||null),ge(`mdc-list-item--disabled`,n.disabled))},inputs:{lines:`lines`,disableRipple:`disableRipple`,disabled:`disabled`}})}return i})();var qi=(()=>{class i extends Te{static ɵfac=(()=>{let t;return function(n){return(t||(t=Et(i)))(n||i)}})();static ɵcmp=J({type:i,selectors:[[`mat-list`]],hostAttrs:[1,`mat-mdc-list`,`mat-mdc-list-base`,`mdc-list`],exportAs:[`matList`],features:[bt([{provide:Te,useExisting:i}]),wt],ngContentSelectors:Mn,decls:1,vars:0,template:function(e,n){e&1&&(Rt$1(),Ye(0))},styles:[In],encapsulation:2})}return i})();var Ki=(()=>{class i extends Dn{_lines;_titles;_meta;_unscopedContent;_itemText;get activated(){return this._activated}set activated(t){this._activated=fr(t)}_activated=!1;_getAriaCurrent(){return this._hostElement.nodeName===`A`&&this._activated?`page`:null}_hasBothLeadingAndTrailing(){return this._meta.length!==0&&(this._avatars.length!==0||this._icons.length!==0)}static ɵfac=(()=>{let t;return function(n){return(t||(t=Et(i)))(n||i)}})();static ɵcmp=J({type:i,selectors:[[`mat-list-item`],[`a`,`mat-list-item`,``],[`button`,`mat-list-item`,``]],contentQueries:function(e,n,a){if(e&1&&Ki$1(a,Ln,5)(a,we,5)(a,Me,5),e&2){let d;ze(d=je())&&(n._lines=d),ze(d=je())&&(n._titles=d),ze(d=je())&&(n._meta=d)}},viewQuery:function(e,n){if(e&1&&an$1(Nn,5)(En,5),e&2){let a;ze(a=je())&&(n._unscopedContent=a.first),ze(a=je())&&(n._itemText=a.first)}},hostAttrs:[1,`mat-mdc-list-item`,`mdc-list-item`],hostVars:13,hostBindings:function(e,n){e&2&&(ae(`aria-current`,n._getAriaCurrent()),ge(`mdc-list-item--activated`,n.activated)(`mdc-list-item--with-leading-avatar`,n._avatars.length!==0)(`mdc-list-item--with-leading-icon`,n._icons.length!==0)(`mdc-list-item--with-trailing-meta`,n._meta.length!==0)(`mat-mdc-list-item-both-leading-and-trailing`,n._hasBothLeadingAndTrailing())(`_mat-animation-noopable`,n._noopAnimations))},inputs:{activated:`activated`},exportAs:[`matListItem`],features:[wt],ngContentSelectors:Vn,decls:10,vars:0,consts:[[`unscopedContent`,``],[1,`mdc-list-item__content`],[1,`mat-mdc-list-item-unscoped-content`,3,`cdkObserveContent`],[1,`mat-focus-indicator`]],template:function(e,n){e&1&&(Rt$1(On),Ye(0),E(1,`span`,1),Ye(2,1),Ye(3,2),E(4,`span`,2,0),X(`cdkObserveContent`,function(){return n._updateItemLines(!0)}),Ye(6,3),k()(),Ye(7,4),Ye(8,5),Ne$1(9,`div`,3))},dependencies:[tZe],encapsulation:2})}return i})();var Yi=(()=>{class i{static ɵfac=function(e){return new(e||i)};static ɵmod=Fe({type:i});static ɵinj=Re({imports:[gC,ds,x6,Vt,$v]})}return i})();var Ne=(()=>{class i{_extractionManagerService=p($n$1);_extractionValidationService=p(hl);_rulesManagerService=p(ul);_taxonomyManagerService=p(bo);_stateService=p(VD);_configurationsManagerService=p(Hr);effectiveConfidenceThreshold=z$1(()=>this._configurationsManagerService.ignoreConfidence()?0:this._stateService.confidenceThreshold()??0);isGroupingActive=z$1(()=>this._taxonomyManagerService.hasBusinessRulesDefined()||this.effectiveConfidenceThreshold()>0);_topLevelFields=z$1(()=>{let t=this._extractionManagerService.selectedDocumentTypeId();return t?this._extractionManagerService.entities().filter(e=>e.parentId===t).filter(Zi$1):[]});_splitFields=z$1(()=>{let t=this._topLevelFields(),e=this.effectiveConfidenceThreshold();if(!this.isGroupingActive())return{valid:t,invalid:[],groupById:{}};let n=this._stateService.useOcrConfidence(),a=this._rulesManagerService.perFieldRuleSetsDictionary(),d=this._rulesManagerService.perTableFieldRuleSetsCriticalityDictionary(),u=[],S=[],J={};for(let tt of t){let Lt=this._isFieldInvalid(tt,e,n,a,d)?`invalid`:`valid`;J[tt.id]=Lt,(Lt===`invalid`?S:u).push(tt)}return{valid:u,invalid:S,groupById:J}});validFields=z$1(()=>this._splitFields().valid);invalidFields=z$1(()=>this._splitFields().invalid);groupOf(t){return!t||!this.isGroupingActive()?null:this._splitFields().groupById[t]??null}_isFieldInvalid(t,e,n,a,d){if(e>0){let u=n?t.ocrConfidence:t.confidence;if(Se(u)&&u<e)return!0}return!!(!t.valueIds.length||a[t.fieldId]?.some(u=>!u.isValid)||d[t.fieldId])}static ɵfac=function(e){return new(e||i)};static ɵprov=R({token:i,factory:i.ɵfac,providedIn:`root`})}return i})();var Rt=(function(i){return i.Ocr=`ocr`,i.Extraction=`extraction`,i})(Rt||{});var Zi=(()=>{class i{_stateService=p(VD);value=z$1(()=>this._stateService.useOcrConfidence()?Rt.Ocr:Rt.Extraction);confidenceTypes=Rt;setConfidenceDisplay(t){this._stateService.useOcrConfidence.set(t===Rt.Ocr)}static ɵfac=function(e){return new(e||i)};static ɵcmp=J({type:i,selectors:[[`ui-du-vs-classic-confidence-switch`]],decls:14,vars:20,consts:[[`id`,`confidence-switch-label`],[`aria-labelledby`,`confidence-switch-label`,3,`value`],[`data-testid`,`confidence-toggle-ocr`,`automation-id`,`confidence-toggle-ocr`,1,`left-button-toggle`,3,`click`,`aria-label`,`value`,`matTooltip`],[`data-testid`,`confidence-toggle-extraction`,`automation-id`,`confidence-toggle-extraction`,1,`right-button-toggle`,3,`click`,`aria-label`,`value`,`matTooltip`]],template:function(e,n){if(e&1&&(E(0,`label`,0),H(1),V(2,`translate`),k(),E(3,`mat-button-toggle-group`,1),ei(4),V(5,`translate`),ei(6),V(7,`translate`),E(8,`mat-button-toggle`,2),V(9,`translate`),X(`click`,function(){return n.setConfidenceDisplay(n.confidenceTypes.Ocr)}),H(10),k(),E(11,`mat-button-toggle`,3),V(12,`translate`),X(`click`,function(){return n.setConfidenceDisplay(n.confidenceTypes.Extraction)}),H(13),k()()),e&2){C(),$e(U(2,10,`VS_EXTRACTION_RESULTS_CONFIDENCE`)),C(2),W(`value`,n.value());let a=U(5,12,`VS_EXTRACTION_RESULTS_OCR`),d=U(7,14,`VS_EXTRACTION_RESULTS_EXTRACTION`);C(5),Ll(`aria-label`,a),W(`value`,n.confidenceTypes.Ocr)(`matTooltip`,U(9,16,`VS_EXTRACTION_RESULTS_OCR_CONFIDENCE_SELECTION_TOOLTIP`)),C(2),qe(``,a,` `),C(),Ll(`aria-label`,d),W(`value`,n.confidenceTypes.Extraction)(`matTooltip`,U(12,18,`VS_EXTRACTION_RESULTS_EXTRACTION_CONFIDENCE_SELECTION_TOOLTIP`)),C(2),qe(``,d,` `)}},dependencies:[On$1,xr,wi,zy,CO,YD,Dt],styles:[`[_nghost-%COMP%]{--%NS%mat-button-toggle-height: 25px;--%NS%mat-button-toggle-selected-state-background-color: var(--%NS%color-background-pressed);--%NS%mat-button-toggle-selected-state-text-color: var(--%NS%color-primary);--%NS%mat-button-toggle-shape: 5px;display:flex;gap:12px;font-size:12px;padding:10px 15px;align-items:center}`]})}return i})();function Bn(i,r){if(i&1&&H(0),i&2){P();qe(` `,qt(0).toLocaleLowerCase(),` `)}}var Ee=(()=>{class i{hotkey=de$1();tooltip=de$1();color=de$1();bgColor=de$1();defaultColor=AR.Colors.ColorWhite;defaultBgColor=AR.Colors.ColorPrimaryLight;static ɵfac=function(e){return new(e||i)};static ɵcmp=J({type:i,selectors:[[`ui-hotkey-box`]],hostVars:2,hostBindings:function(e,n){e&2&&ge(`ui-hotkey-box`,!0)},inputs:{hotkey:[1,`hotkey`],tooltip:[1,`tooltip`],color:[1,`color`],bgColor:[1,`bgColor`]},decls:3,vars:10,consts:[[1,`box`,3,`matTooltip`,`matTooltipDisabled`]],template:function(e,n){if(e&1&&(ei(0),E(1,`span`,0),ee(2,Bn,1,1),k()),e&2){let d=!!qn$1(n.hotkey());C(),ur(`background`,n.bgColor()||n.defaultBgColor)(`color`,n.color()||n.defaultColor),ge(`help-cursor`,d&&n.tooltip()),W(`matTooltip`,n.tooltip()??``)(`matTooltipDisabled`,!d),C(),te(d?2:-1)}},dependencies:[xr,wi],styles:[`[_nghost-%COMP%]{display:inline-flex}[_nghost-%COMP%]   .box[_ngcontent-%COMP%]{display:inline-flex;align-items:center;justify-content:space-around;font-size:var(--%NS%apollo-font-m-size);height:24px;min-width:24px;box-sizing:border-box;padding:0 var(--%NS%apollo-pad-s)}[_nghost-%COMP%]   .box.help-cursor[_ngcontent-%COMP%]{cursor:help}`]})}return i})();function Un(i,r){if(i&1&&(E(0,`div`,4),H(1),V(2,`translate`),k()),i&2){P(2);let t=qt(1);ge(`italic`,!t),C(),qe(` `,t||U(2,3,`VS_EXTRACTION_RESULT_VALIDATOR_EMPTY_NOTES_STRING`),`
`)}}function zn(i,r){if(i&1){let t=nt();E(0,`mat-form-field`,3)(1,`ui-du-compact-base-textarea`,5),V(2,`translate`),X(`valueChange`,function(n){Ce$1(t);return xe(P(2).handleValueChange(n))}),k()()}if(i&2){P(2);let t=qt(1);C(),W(`size`,`small`)(`value`,t)(`maxRows`,3)(`ariaLabel`,U(2,4,`VS_EXTRACTION_RESULT_VALIDATOR_NOTES_LABEL`))}}function Xn(i,r){if(i&1&&ee(0,Un,3,5,`div`,2)(1,zn,3,6,`mat-form-field`,3),i&2)te(P().isReadonly()?0:1)}function Hn(i,r){if(i&1&&(E(0,`mat-radio-button`,7),H(1),k()),i&2){let t=r.$implicit;W(`value`,t),C(),$e(t)}}function jn(i,r){if(i&1){let t=nt();E(0,`mat-radio-group`,6),V(1,`translate`),X(`change`,function(n){Ce$1(t);return xe(P().handleValueChange(n.value))}),Hn$1(2,Hn,2,2,`mat-radio-button`,7,ma$1),k()}if(i&2){let t=P(),e=qt(0);W(`value`,qt(1))(`disabled`,t.isReadonly()),ae(`aria-label`,U(1,3,`TAXO_VALIDATOR_NOTES_TYPE_ARIA_LABEL`)),C(2),Un$1(e.options)}}var de=(()=>{class i extends pGt{static ɵfac=(()=>{let t;return function(n){return(t||(t=Et(i)))(n||i)}})();static ɵcmp=J({type:i,selectors:[[`ui-du-vs-classic-validator-notes`]],hostAttrs:[1,`ui-validator-notes`],features:[wt],decls:7,vars:6,consts:[[1,`notes-label`],[3,`value`,`disabled`],[`data-testid`,`readonly-text-note`,1,`readonly-text-note`,3,`italic`],[1,`material-default`,`apollo-textfield-small`,`no-subscript`],[`data-testid`,`readonly-text-note`,1,`readonly-text-note`],[3,`valueChange`,`size`,`value`,`maxRows`,`ariaLabel`],[3,`change`,`value`,`disabled`],[3,`value`]],template:function(e,n){if(e&1&&(ei(0)(1),E(2,`div`,0),H(3),V(4,`translate`),k(),ee(5,Xn,2,1)(6,jn,4,5,`mat-radio-group`,1)),e&2){let a,d=qn$1(n.taxonomy());C(),qn$1(n.notes()?.value??``),C(2),qe(` `,U(4,4,`VS_EXTRACTION_RESULT_VALIDATOR_NOTES_LABEL`),`
`),C(2),te((a=d.type)===n.ValidatorNotesType.Text?5:a===n.ValidatorNotesType.Options?6:-1)}},dependencies:[uo,Xx,ay,jm,id,Qo,Jt,oh,Dt],styles:[`[_nghost-%COMP%]{display:flex;width:100%;justify-content:flex-start;align-items:center;gap:var(--%NS%apollo-pad-m)}[_nghost-%COMP%]   .notes-label[_ngcontent-%COMP%]{font-weight:var(--%NS%apollo-font-weight-semibold)}[_nghost-%COMP%]   .readonly-text-note.italic[_ngcontent-%COMP%]{font-style:italic}`]})}return i})();var tn=(()=>{class i{_extractionManagerService=p($n$1);value=de$1.required();anchor=de$1(void 0);isMainAnchor=de$1(!1);readonly=de$1(!1);onValueChange(t,e){if(!e)return;let n=this.value();if(!n.anchorData)return;let a=n.anchorData.anchors.map(S=>S.id===e?z(y({},S),{text:t}):S),d=n.anchorData.mainAnchor.id===e?z(y({},n.anchorData.mainAnchor),{text:t}):n.anchorData.mainAnchor,u=z(y({},n),{confirmationStatus:He.Confirmed,confidence:1,anchorData:z(y({},n.anchorData),{mainAnchor:d,anchors:a})});this._extractionManagerService.updateExtractedPrimaryValue(u)}static ɵfac=function(e){return new(e||i)};static ɵcmp=J({type:i,selectors:[[`ui-du-vs-classic-anchor-input`]],hostAttrs:[1,`ui-anchor-input`],inputs:{value:[1,`value`],anchor:[1,`anchor`],isMainAnchor:[1,`isMainAnchor`],readonly:[1,`readonly`]},decls:4,vars:8,consts:[[3,`matTooltip`],[3,`valueChange`,`readonly`,`maxRows`,`value`]],template:function(e,n){e&1&&(E(0,`mat-icon`,0),V(1,`translate`),H(2,`anchor
`),k(),E(3,`ui-du-vs-classic-textbox`,1),X(`valueChange`,function(d){let u;return n.onValueChange(d,(u=n.anchor())==null?null:u.id)}),k()),e&2&&(ge(`is-target`,n.isMainAnchor()),W(`matTooltip`,n.isMainAnchor()?U(1,6,`VS_ANCHOR_INPUT_TARGET_ANCHOR_ICON_TOOLTIP`):``),C(3),W(`readonly`,n.readonly())(`maxRows`,3)(`value`,n.anchor()?.text??``))},dependencies:[Xn$1,bn,xr,wi,Be,Dt],styles:[`[_nghost-%COMP%]{display:flex;align-items:flex-start}[_nghost-%COMP%] > mat-icon[_ngcontent-%COMP%]{margin-top:10px;margin-right:5px;transform:rotate(-25deg);height:18px;width:18px;font-size:18px;color:var(--%NS%color-foreground-secondary)}[_nghost-%COMP%] > mat-icon.is-target[_ngcontent-%COMP%]{color:var(--%NS%color-primary)}`]})}return i})();var Wn=i=>({anchorsNumber:i});var Gn=(i,r)=>r.id;function $n(i,r){i&1&&(E(0,`mat-error`),H(1),V(2,`translate`),k()),i&2&&(C(),qe(` `,U(2,1,`VS_ANCHOR_VALUE_IS_REQUIRED_ERROR_MSG`),` `))}function Qn(i,r){i&1&&(E(0,`mat-error`),H(1),V(2,`translate`),k()),i&2&&(C(),qe(` `,U(2,1,`VS_ANCHOR_TARGET_IS_REQUIRED_ERROR_MSG`),` `))}function qn(i,r){if(i&1&&Ne$1(0,`ui-du-vs-classic-anchor-input`,7),i&2){let t=r.$implicit;P();let e=qt(0);W(`anchor`,t)(`value`,e)(`isMainAnchor`,!1)}}var en=(()=>{class i extends Ua$1{static ɵfac=(()=>{let t;return function(n){return(t||(t=Et(i)))(n||i)}})();static ɵcmp=J({type:i,selectors:[[`ui-du-vs-classic-anchor-value`]],features:[wt],decls:16,vars:24,consts:[[3,`field`,`taxonomy`,`value`,`valueIndex`,`textDirection`],[`ngProjectAs`,`content`,5,[`content`]],[1,`anchor-content`],[1,`icon`],[3,`change`,`revert`,`remove`,`textDirectionChange`,`reverseWords`,`stateChange`,`disableChange`,`disableRevert`,`displayRemove`,`displayTextDirection`,`displayReverseWords`,`shouldMarkAsMissingInsteadOfRemove`,`shouldAddInsteadOfChange`,`hotkeys`],[`ngProjectAs`,`after-content`,5,[`after-content`]],[1,`anchors`],[3,`anchor`,`value`,`isMainAnchor`]],template:function(e,n){if(e&1&&(ei(0),E(1,`ui-du-vs-classic-value-shell`,0),Mo(2,1),E(3,`div`,2),H(4),V(5,`translate`),E(6,`mat-icon`,3),H(7,`anchor`),k(),ee(8,$n,3,3,`mat-error`)(9,Qn,3,3,`mat-error`),k(),E(10,`ui-compact-actions-menu`,4),X(`change`,function(){return n.changeExtractedValue()})(`revert`,function(){return n.revertToPreviousValue()})(`remove`,function(){return n.removeExtractedValue()})(`textDirectionChange`,function(d){return n.onTextDirectionChange(d)})(`reverseWords`,function(){return n.reverseWords()})(`stateChange`,function(d){return n.menuOpen.set(d===`open`)}),k(),Ao(),Mo(11,5),E(12,`div`,6),Ne$1(13,`ui-du-vs-classic-anchor-input`,7),Hn$1(14,qn,1,3,`ui-du-vs-classic-anchor-input`,7,Gn),k(),Ao(),k()),e&2){let a=n.field(),d=n.taxonomy(),u=qn$1(n.value());C(),W(`field`,a)(`taxonomy`,d)(`value`,u)(`valueIndex`,n.valueIndex())(`textDirection`,n.textDirection()),C(3),qe(` `,No(5,19,`VS_ANCHOR_VALUE_NUMBER_OF_ANCHORS`,io$1(22,Wn,(u.anchorData?.anchors?.length||0)+1)),` `);let S=n.validationError();C(4),te(S===n.ValidationCode.AnchorTextRequired?8:S===n.ValidationCode.AnchorTargetRequired?9:-1),C(2),W(`disableChange`,!n.pdfHasValidSelectionForValue())(`disableRevert`,!n.hasHistory())(`displayRemove`,d.type!==n.TaxonomyDefinitionType.DocumentType)(`displayTextDirection`,n.displayRTLFeatures())(`displayReverseWords`,n.displayRTLFeatures())(`shouldMarkAsMissingInsteadOfRemove`,a.valueIds.length===1)(`shouldAddInsteadOfChange`,a.valueIds.length===0)(`hotkeys`,n.hotkeys()),C(3),W(`anchor`,u.anchorData==null?null:u.anchorData.mainAnchor)(`value`,u)(`isMainAnchor`,!0),C(),Un$1(u.anchorData?.anchors)}},dependencies:[Xl,zv,Xn$1,bn,iYt,pe$1,tn,Dt],styles:[`[_nghost-%COMP%]   .anchor-content[_ngcontent-%COMP%]{position:relative;margin-bottom:1.25em;padding-top:1.28125em;max-width:100%;max-height:160px;flex-grow:1;display:flex;align-items:center}[_nghost-%COMP%]   .anchor-content[_ngcontent-%COMP%]   .icon[_ngcontent-%COMP%]{transform:rotate(-25deg);margin-left:5px;height:18px;width:18px;font-size:18px}[_nghost-%COMP%]   .anchor-content[_ngcontent-%COMP%] > .mat-mdc-form-field-error[_ngcontent-%COMP%]{position:absolute;bottom:-15px;font-size:75%}[_nghost-%COMP%]   .anchors[_ngcontent-%COMP%]{margin:0 40px 0 36px;padding:0 0 0 16px;border-left:1px solid var(--%NS%color-border)}`]})}return i})();var Kn=(i,r)=>r.id;function Yn(i,r){if(i&1&&Ne$1(0,`ui-confidence`,3),i&2){let t=P().$implicit,e=P();W(`tooltip`,e.confidenceTooltipKey())(`confidence`,(e.useOcrConfidence()?t.ocrConfidence:t.confidence)??void 0)(`unitInterval`,!0)}}function Zn(i,r){i&1&&(E(0,`mat-icon`,6),H(1,`check`),k())}function Jn(i,r){if(i&1){let t=nt();E(0,`mat-icon`,8),V(1,`translate`),X(`click`,function(){Ce$1(t);let n=P().$index;return xe(P().onCheckboxClick(n))}),H(2,`swap_vert`),k()}i&2&&W(`matTooltip`,U(1,1,`VS_VALUE_SWAP_SUGGESTION`)+` (Enter)`)}function ta(i,r){if(i&1){let t=nt();E(0,`mat-list-item`,2),X(`click`,function(){let n=Ce$1(t).$index;return xe(P().highlightSuggestion(n))}),ee(1,Yn,1,3,`ui-confidence`,3),E(2,`span`,4),H(3),k(),E(4,`div`,5),ee(5,Zn,2,0,`mat-icon`,6)(6,Jn,3,3,`mat-icon`,7),k()()}if(i&2){let t=r.$implicit,e=r.$index,n=P();ge(`highlighted`,n.highlightedSuggestionIndex()===e),W(`id`,`suggestion-option-id-`+t.id),ae(`data-testid`,`suggestion-item_`+e+`_`+t.id)(`aria-labelledby`,`suggestion-option-id-`+t.id)(`aria-selected`,n.selectedSuggestionIndex()===e),C(),te(n.showConfidence()?1:-1),C(2),$e(t.value),C(2),te(n.selectedSuggestionIndex()===e?5:6)}}var nn=(()=>{class i extends Ba$1{_stateService=p(VD);closed=Yt();isOpen=pe(!0);useOcrConfidence=this._stateService.useOcrConfidence;confidenceTooltipKey=z$1(()=>this.useOcrConfidence()?`VS_VALUE_CONFIDENCE_OCR_TOOLTIP`:`VS_VALUE_CONFIDENCE_EXTRACTION_TOOLTIP`);onClose(t){super.onClose(t),this.closed.emit()}highlightSuggestion(t){this.highlightedSuggestionIndex.set(Jd(t,0,this.suggestionModels().length-1))}ngOnDestroy(){this.onClose()}static ɵfac=(()=>{let t;return function(n){return(t||(t=Et(i)))(n||i)}})();static ɵcmp=J({type:i,selectors:[[`ui-du-vs-classic-suggestions`]],outputs:{closed:`closed`},features:[wt],decls:4,vars:4,consts:[[`data-testid`,`suggestions-list`,`tabindex`,`0`,`role`,`listbox`,3,`keyup.arrowup`,`keyup.arrowleft`,`keyup.arrowdown`,`keyup.arrowright`,`keydown.enter`,`keydown.space`,`keydown.tab`,`keydown.shift.tab`],[`role`,`option`,`data-testid`,`suggestion-option`,3,`highlighted`,`id`],[`role`,`option`,`data-testid`,`suggestion-option`,3,`click`,`id`],[`matListItemIcon`,``,`confidenceUndefinedTooltip`,`VS_CONFIDENCE_NOT_REPORTED_TOOLTIP`,1,`suggestion-confidence`,3,`tooltip`,`confidence`,`unitInterval`],[`matListItemTitle`,``,1,`value`],[`matListItemMeta`,``],[`color`,`primary`,`automation-id`,`checkmark`,`data-testid`,`checkmark`],[`data-testid`,`replace`,`automation-id`,`replace`,1,`suggestion-replace`,3,`matTooltip`],[`data-testid`,`replace`,`automation-id`,`replace`,1,`suggestion-replace`,3,`click`,`matTooltip`]],template:function(e,n){if(e&1&&(E(0,`mat-list`,0),V(1,`translate`),X(`keyup.arrowup`,function(){return n.navigateThroughOptions(`up`)})(`keyup.arrowleft`,function(){return n.navigateThroughOptions(`up`)})(`keyup.arrowdown`,function(){return n.navigateThroughOptions(`down`)})(`keyup.arrowright`,function(){return n.navigateThroughOptions(`down`)})(`keydown.enter`,function(d){return n.replaceSuggestionViaKeyboard(d)})(`keydown.space`,function(d){return n.replaceSuggestionViaKeyboard(d)})(`keydown.tab`,function(){return n.onClose()})(`keydown.shift.tab`,function(){return n.onClose()}),Hn$1(2,ta,7,9,`mat-list-item`,1,Kn),k()),e&2){let a=n.suggestionModels();ae(`aria-label`,U(1,2,`VS_COMPACT_FIELD_VALUE_SUGGESTIONS_TITLE`))(`aria-activedescendant`,`suggestion-option-id-`+n.highlightedSuggestion().id),C(2),Un$1(a)}},dependencies:[Xn$1,bn,Yi,qi,Ki,Ie,we,Me,xr,wi,Ge,Dt],styles:[`[_nghost-%COMP%]   mat-list-item[_ngcontent-%COMP%]{min-height:3em}[_nghost-%COMP%]   mat-list-item[_ngcontent-%COMP%]:not(.highlighted):hover{background-color:var(--%NS%color-background-hover)}[_nghost-%COMP%]   mat-list-item.highlighted[_ngcontent-%COMP%]{background-color:var(--%NS%color-background-pressed)}[_nghost-%COMP%]   .suggestion-replace[_ngcontent-%COMP%]{cursor:pointer}[_nghost-%COMP%]   .suggestion-replace[_ngcontent-%COMP%]:hover{color:var(--%NS%color-foreground-link)}`]})}return i})();var ea=(i,r)=>[i,r];function ia(i,r){i&1&&(E(0,`span`,7),V(1,`translate`),H(2),V(3,`translate`),k()),i&2&&(W(`matTooltip`,U(1,2,`VS_SIMPLE_FIELD_REMOVED_MESSAGE_TOOLTIP`)),C(2),qe(` `,U(3,4,`VS_SIMPLE_FIELD_REMOVED_MESSAGE`),` `))}function na(i,r){i&1&&(E(0,`span`,7),V(1,`translate`),H(2),V(3,`translate`),k()),i&2&&(W(`matTooltip`,U(1,2,`VS_SIMPLE_FIELD_NO_DATA_MESSAGE_TOOLTIP`)),C(2),qe(` `,U(3,4,`VS_SIMPLE_FIELD_NO_DATA_MESSAGE`),` `))}function aa(i,r){if(i&1&&(E(0,`i`,3),ee(1,ia,4,6,`span`,7)(2,na,4,6,`span`,7),k()),i&2){let t=P(),e=qt(0);C(),te(e.confirmationStatus===t.ConfirmationStatus.Confirmed?1:2)}}function oa(i,r){i&1&&(E(0,`mat-error`,11),H(1),V(2,`translate`),k()),i&2&&(C(),qe(` `,U(2,1,`VS_TABLE_FIELD_MISSING_CELL_VALUE_ERROR_MSG`),` `))}function sa(i,r){if(i&1&&(E(0,`div`,10),ee(1,oa,3,3,`mat-error`,11),k()),i&2){P();let t=qt(6),e=P();C(),te(t===e.ValidationCode.InvalidCells?1:-1)}}function ra(i,r){if(i&1&&(E(0,`div`,8)(1,`span`),H(2),V(3,`translate`),k(),E(4,`mat-icon`,9),H(5,`apps`),k()(),ei(6),ee(7,sa,2,1,`div`,10)),i&2){C(2),$e(U(3,2,`VS_TABLE_FIELD_TITLE`)),C(4);let t=qn$1(P().validationError());C(),te(t?7:-1)}}function la(i,r){if(i&1&&(Mo(0,4),Ne$1(1,`ui-du-vs-classic-validator-notes`,12),Ao()),i&2){let t=P(),e=qt(0),n=qt(7),a=qt(8);C(),W(`fieldId`,e.id)(`taxonomy`,n)(`notes`,a)(`appInReadonlyMode`,t.readonly())}}function ca(i,r){if(i&1){let t=nt();ei(0),V(1,`translate`),ei(2),V(3,`uiHotkeysComboDisplay`),E(4,`button`,13),X(`click`,function(){Ce$1(t);return xe(P().revertToPreviousValue())}),E(5,`mat-icon`),H(6,`undo`),k()(),ei(7),V(8,`translate`),E(9,`button`,14),Ne$1(10,`mat-icon`,15),k()}if(i&2){let t,e=P(),n=U(1,5,`VS_SIMPLE_FIELD_REVERT_TOOLTIP`),a=U(3,7,(t=e.hotkeys())==null||t.revert==null?null:t.revert.combos);C(4),Ll(`aria-label`,n),W(`matTooltip`,ro$1(11,ea,n,a).join(` `))(`disabled`,!e.hasHistory());let d=U(8,9,`VS_SIMPLE_FIELD_CREATE_NEW_TABLE_VALUE_TOOLTIP`);C(5),Ll(`aria-label`,d),W(`matTooltip`,d)}}function da(i,r){if(i&1){let t=nt();E(0,`ui-compact-actions-menu`,16),X(`revert`,function(){Ce$1(t);return xe(P().revertToPreviousValue())})(`remove`,function(){Ce$1(t);return xe(P().removeExtractedValue())}),k()}if(i&2){let t=P(),e=qt(1);W(`disableRevert`,!t.hasHistory())(`disableRemove`,e)(`displayChange`,!1)(`displayTextDirection`,!1)(`displayReverseWords`,!1)(`shouldAddInsteadOfChange`,!0)(`hotkeys`,t.hotkeys())}}var an=(()=>{class i extends za$1{removeExtractedValue(){let t=this.field().id;this._extractionManagerService.setSelectedValue(t);let e=[...this.field().valueIds,this.field().headerRowId];this._extractionManagerService.removeExtractedValues(t,e),this._tableService.isTableEditorVisible.set(!1)}static ɵfac=(()=>{let t;return function(n){return(t||(t=Et(i)))(n||i)}})();static ɵcmp=J({type:i,selectors:[[`ui-du-vs-classic-table-value`]],hostAttrs:[1,`ui-table-value`],features:[wt],decls:13,vars:12,consts:[[3,`click`,`field`,`taxonomy`,`value`,`valueIndex`,`readonly`],[`ngProjectAs`,`content`,5,[`content`]],[1,`content-wrapper`],[`data-testid`,`missing-value-message`,1,`text`],[`ngProjectAs`,`validator-notes-value-level`,5,[`validator-notes-value-level`]],[`ngProjectAs`,`post-suffix-content`,5,[`post-suffix-content`]],[3,`disableRevert`,`disableRemove`,`displayChange`,`displayTextDirection`,`displayReverseWords`,`shouldAddInsteadOfChange`,`hotkeys`],[3,`matTooltip`],[1,`top-side`],[`fontSet`,`material-icons-outlined`],[1,`bottom-side`],[`data-testid`,`error`],[`data-testid`,`validator-notes`,1,`validator-notes`,3,`fieldId`,`taxonomy`,`notes`,`appInReadonlyMode`],[`mat-icon-button`,``,`data-testid`,`missing-value-revert`,3,`click`,`aria-label`,`matTooltip`,`disabled`],[`mat-icon-button`,``,`data-testid`,`missing-value-add`,3,`aria-label`,`matTooltip`],[`svgIcon`,`ui_add_grid`],[3,`revert`,`remove`,`disableRevert`,`disableRemove`,`displayChange`,`displayTextDirection`,`displayReverseWords`,`shouldAddInsteadOfChange`,`hotkeys`]],template:function(e,n){if(e&1&&(ei(0)(1),E(2,`ui-du-vs-classic-value-shell`,0),X(`click`,function(){return n.openTableEditor()}),Mo(3,1),E(4,`div`,2),ee(5,aa,3,1,`i`,3)(6,ra,8,5),k(),Ao(),ei(7)(8),ee(9,la,2,4,`ng-container`,4),Mo(10,5),ee(11,ca,11,14)(12,da,1,7,`ui-compact-actions-menu`,6),Ao(),k()),e&2){let a=qn$1(n.field());C();let d=qn$1(!a.valueIds.length);C(),W(`field`,a)(`taxonomy`,n.taxonomy())(`value`,n.dummyPrimaryValue())(`valueIndex`,0)(`readonly`,n.readonly()),C(3),te(d?5:6),C(2);let u=qn$1(n.validatorNotesTaxonomy());C(),qn$1(n.validatorNotes()),C(),te(u&&u.enabled&&u.level===n.validatorNotesLevel.Value&&!d?9:-1),C(2),te(d?11:n.readonly()?-1:12)}},dependencies:[Xn$1,bn,xr,wi,On$1,jn$1,Xl,zv,pe$1,de,iYt,Dt,O6],styles:[`[_nghost-%COMP%]   .content-wrapper[_ngcontent-%COMP%]{display:flex;flex-direction:column;flex-grow:1;padding-left:8px;justify-content:center}[_nghost-%COMP%]   .content-wrapper[_ngcontent-%COMP%]   .top-side[_ngcontent-%COMP%]{display:flex;justify-content:flex-end;align-items:center;flex-grow:1;gap:12px;color:var(--%NS%color-foreground-secondary)}[_nghost-%COMP%]   .content-wrapper[_ngcontent-%COMP%]   .bottom-side[_ngcontent-%COMP%]{flex-grow:1;font-size:var(--%NS%apollo-font-xs-size)}[_nghost-%COMP%]   .content-wrapper[_ngcontent-%COMP%]   .bottom-side[_ngcontent-%COMP%]   .text[_ngcontent-%COMP%]{color:var(--%NS%color-foreground-secondary)}[_nghost-%COMP%]   .content-wrapper.no-values[_ngcontent-%COMP%]{flex-direction:row;padding-left:0}`]})}return i})();var ma=i=>({key:i});var _a=(i,r)=>r.id;function pa(i,r){i&1&&(E(0,`mat-icon`,17),V(1,`translate`),H(2,` anchor `),k()),i&2&&W(`matTooltip`,ns(U(1,2,`VS_FIELD_EDIT_CAPABILITIES_ANCHORS_TOOLTIP`)))}function ha(i,r){i&1&&(E(0,`mat-icon`,18),V(1,`translate`),H(2,`crop_free`),k()),i&2&&W(`matTooltip`,ns(U(1,2,`VS_FIELD_EDIT_CAPABILITIES_AREA_ONLY_TOOLTIP`)))}function ua(i,r){i&1&&(E(0,`mat-icon`,19),V(1,`translate`),H(2,`short_text`),k()),i&2&&W(`matTooltip`,ns(U(1,2,`VS_FIELD_EDIT_CAPABILITIES_TOKENS_ONLY_TOOLTIP`)))}function ga(i,r){if(i&1&&(E(0,`span`,6),ee(1,pa,3,4,`mat-icon`,17),ee(2,ha,3,4,`mat-icon`,18),ee(3,ua,3,4,`mat-icon`,19),k()),i&2){let t=P();C(),te(t.showAnchorIcon()?1:-1),C(),te(t.showAreaIcon()?2:-1),C(),te(t.showTokensIcon()?3:-1)}}function fa(i,r){i&1&&(E(0,`mat-chip`,8),H(1),V(2,`translate`),k()),i&2&&(C(),qe(` `,U(2,1,`TAXO_FIELD_DEFAULT_VALUE`),` `))}function va(i,r){i&1&&(E(0,`mat-chip`,9),H(1),V(2,`translate`),k()),i&2&&(C(),qe(` `,U(2,1,`VS_FIELD_VALUE_VALIDATED_CHIP`),` `))}function ba(i,r){if(i&1){let t=nt();ei(0),V(1,`uiHotkeysComboDisplay`),E(2,`ui-counter`,20),V(3,`translate`),X(`click`,function(){Ce$1(t);return xe(P().toggleSuggestions())}),k()}if(i&2){let t,e=P(),n=U(1,5,(t=e.toggleSuggestionsShortcut())==null?null:t.combos)??``;C(2),W(`tooltip`,va$1(``,U(3,7,`VS_FIELD_VALUE_SUGGESTION_COUNTER_TOOLTIP`),` `,n))(`active`,e.suggestionsOpen())(`value`,e.suggestions().length)}}function xa(i,r){if(i&1&&Ne$1(0,`ui-du-vs-classic-validator-notes`,21),i&2){P();let t=qt(0),e=qt(1),n=P();W(`fieldId`,qt(2).id)(`taxonomy`,t)(`notes`,e)(`appInReadonlyMode`,n.readonly())}}function Ca(i,r){if(i&1&&(ei(0)(1),ee(2,xa,1,4,`ui-du-vs-classic-validator-notes`,21)),i&2){let t=P(),e=qt(2),a=qn$1(qt(3).validatorNotes);C(),qn$1(e.validatorNotes),C(),te(a&&a.enabled&&a.level===t.ValidatorNotesLevel.Field?2:-1)}}function ya(i,r){if(i&1&&Ne$1(0,`ui-du-vs-classic-table-value`,14),i&2){let t=P(),e=qt(2),n=qt(3),a=e.valueIds.length?(t.readonly()?`readonly-`:``)+`field-value_0_0`:`missing-field-value`;W(`field`,e)(`taxonomy`,n)(`readonly`,t.readonly()),ae(`data-testid`,a)}}function Sa(i,r){i&1&&H(0,` Field Groups are not supported in classic `)}function ka(i,r){if(i&1&&Ne$1(0,`ui-du-vs-classic-readonly-value`,22),i&2){P(3);let t=qt(2),e=qt(3);W(`field`,t)(`taxonomy`,e)(`value`,null)(`valueIndex`,-1)}}function Ta(i,r){if(i&1&&Ne$1(0,`ui-du-vs-classic-missing-value`,23),i&2){P(3);let t=qt(2),e=qt(3);W(`field`,t)(`taxonomy`,e)}}function wa(i,r){if(i&1&&ee(0,ka,1,4,`ui-du-vs-classic-readonly-value`,22)(1,Ta,1,2,`ui-du-vs-classic-missing-value`,23),i&2)te(P(2).readonly()?0:1)}function Ma(i,r){if(i&1&&Hn$1(0,Sa,1,0,null,null,ma$1,!1,wa,2,1),i&2){P();Un$1(qt(2).valueIds)}}function Ia(i,r){if(i&1&&Ne$1(0,`ui-du-vs-classic-readonly-value`,24),i&2){let t=P(),e=t.$implicit,n=t.$index,a=qt(0),d=P(2),u=qt(2),S=qt(3);W(`field`,u)(`taxonomy`,S)(`value`,e)(`valueIndex`,d.parentValueIndex()??n),ae(`data-testid`,a)}}function Na(i,r){if(i&1&&Ne$1(0,`ui-du-vs-classic-anchor-value`,24),i&2){let t=P(2),e=t.$implicit,n=t.$index,a=qt(0),d=P(2),u=qt(2),S=qt(3);W(`field`,u)(`taxonomy`,S)(`value`,e)(`valueIndex`,d.parentValueIndex()??n),ae(`data-testid`,a)}}function Ea(i,r){if(i&1&&Ne$1(0,`ui-du-vs-classic-simple-value`,24),i&2){let t=P(2),e=t.$implicit,n=t.$index,a=qt(0),d=P(2),u=qt(2),S=qt(3);W(`field`,u)(`taxonomy`,S)(`value`,e)(`valueIndex`,d.parentValueIndex()??n),ae(`data-testid`,a)}}function Oa(i,r){if(i&1&&ee(0,Na,1,5,`ui-du-vs-classic-anchor-value`,24)(1,Ea,1,5,`ui-du-vs-classic-simple-value`,24),i&2){let t=P().$implicit;te(t.isAnchorBased?0:1)}}function Va(i,r){i&1&&Ne$1(0,`mat-divider`)}function Ra(i,r){if(i&1&&(ei(0),ee(1,Ia,1,5,`ui-du-vs-classic-readonly-value`,24)(2,Oa,2,1),ee(3,Va,1,0,`mat-divider`)),i&2){let t=r.$index,e=r.$count,n=P(2),a=qt(3);qn$1(`ui-value`+t),C(),te(n.readonly()?1:a.type!==n.TaxonomyDefinitionType.FieldGroup&&a.type!==n.TaxonomyDefinitionType.Table?2:-1),C(2),te(t!==e-1?3:-1)}}function La(i,r){if(i&1&&Ne$1(0,`ui-du-vs-classic-readonly-value`,22),i&2){P(3);let t=qt(2),e=qt(3);W(`field`,t)(`taxonomy`,e)(`value`,null)(`valueIndex`,-1)}}function Aa(i,r){if(i&1&&Ne$1(0,`ui-du-vs-classic-missing-value`,23),i&2){P(3);let t=qt(2),e=qt(3);W(`field`,t)(`taxonomy`,e)}}function Pa(i,r){if(i&1&&ee(0,La,1,4,`ui-du-vs-classic-readonly-value`,22)(1,Aa,1,2,`ui-du-vs-classic-missing-value`,23),i&2){let t=P(2),e=qt(4);te(t.readonly()?0:e?-1:1)}}function Da(i,r){if(i&1&&Hn$1(0,Ra,4,3,null,null,_a,!1,Pa,2,1),i&2)Un$1(P().fieldValues())}function Fa(i,r){if(i&1){let t=nt();ei(0),V(1,`translate`),E(2,`div`,15)(3,`button`,25),V(4,`uiHotkeysComboDisplay`),X(`click`,function(){Ce$1(t);return xe(P().addNewValueToField())}),E(5,`mat-icon`),H(6,`library_add`),k()()()}if(i&2){let t,e=P(),n=qt(3),a=U(1,4,e.multiValueButtonTooltip()),d=n.requiresReference?`create-value-with-reference`:`create-value-without-reference`;C(3),W(`matTooltip`,a+` `+U(4,6,(t=e.addValueShortcut())==null?null:t.combos))(`disabled`,!e.canAddNewValue()),ae(`data-testid`,d)(`aria-label`,a)}}function Ba(i,r){if(i&1){let t=nt();E(0,`mat-card`,16)(1,`mat-card-content`)(2,`ui-du-vs-classic-suggestions`,26),X(`closed`,function(){Ce$1(t);return xe(P().closeSuggestions())}),k()()()}if(i&2){let t=P(),e=qt(2),n=qt(3);C(2),W(`field`,e)(`taxonomy`,n)(`readonly`,t.readonly())}}var on=(()=>{class i extends Ha$1{ConfirmationStatus=He;suggestionsOpen=Xd(()=>this.isSelected()&&this.hasSuggestions()&&!1);suggestions=z$1(()=>{let t=this.field();return this._extractionManagerService.suggestionsByParentId()[t.id]??[]});toggleSuggestionsShortcut=z$1(()=>this._vsKeyboardShortcutsService.fields()?.toggleSuggestions);constructor(){super(),Ut(t=>{let e=this._registerClassicHotKeys();t(()=>e?.unsubscribe())})}toggleSuggestions(){this.suggestionsOpen.update(t=>!t)}closeSuggestions(){this.suggestionsOpen.set(!1)}_registerClassicHotKeys(){let e=[this.toggleSuggestionsShortcut()].filter(Se);return this._vsKeyboardShortcutsService.listen$(e).pipe(q(()=>this.isSelected())).subscribe(()=>this.toggleSuggestions())}static ɵfac=function(e){return new(e||i)};static ɵcmp=J({type:i,selectors:[[`ui-du-vs-classic-field`]],features:[wt],decls:30,vars:36,consts:[[1,`ui-field`],[1,`data-point`],[`appearance`,`outlined`,1,`field-card`],[1,`header-container`],[1,`name-container`],[3,`hotkey`,`bgColor`,`tooltip`],[1,`edit-reference-capabilities-icon`],[`uiDuSharedSetTitleWhenEllipsesActive`,``,`data-testid`,`field-name`,1,`field-name`],[`data-testid`,`defaulted-chip`,`disableRipple`,`true`,1,`chip-mini`,`validated-chip`],[`data-testid`,`validated-chip`,`disableRipple`,`true`,1,`chip-mini`,`validated-chip`],[1,`field-suggestion-count`,3,`tooltip`,`active`,`value`],[1,`tail-container`],[3,`ruleSet`],[`data-testid`,`field-values`,1,`values`],[3,`field`,`taxonomy`,`readonly`],[1,`add-value`],[`appearance`,`outlined`,1,`field-suggestions-card`],[`data-testid`,`capabilities-icon-anchor`,3,`matTooltip`],[`data-testid`,`capabilities-icon-area`,`color`,`warn`,3,`matTooltip`],[`data-testid`,`capabilities-icon-tokens`,`color`,`primary`,3,`matTooltip`],[1,`field-suggestion-count`,3,`click`,`tooltip`,`active`,`value`],[`data-testid`,`validator-notes`,1,`validator-notes`,3,`fieldId`,`taxonomy`,`notes`,`appInReadonlyMode`],[`data-testid`,`readonly-missing-field-value`,3,`field`,`taxonomy`,`value`,`valueIndex`],[`data-testid`,`missing-field-value`,3,`field`,`taxonomy`],[3,`field`,`taxonomy`,`value`,`valueIndex`],[`mat-icon-button`,``,`color`,`primary`,3,`click`,`matTooltip`,`disabled`],[3,`closed`,`field`,`taxonomy`,`readonly`]],template:function(e,n){if(e&1&&(ei(0),V(1,`uiHotkeysComboDisplay`),ei(2)(3)(4),E(5,`div`,0)(6,`div`,1)(7,`mat-card`,2)(8,`mat-card-content`)(9,`div`,3)(10,`div`,4),Ne$1(11,`ui-hotkey-box`,5),V(12,`translate`),ee(13,ga,4,3,`span`,6),E(14,`span`,7),H(15),V(16,`translate`),k(),E(17,`mat-chip-listbox`),ee(18,fa,3,3,`mat-chip`,8)(19,va,3,3,`mat-chip`,9),k(),ee(20,ba,4,9,`ui-counter`,10),k(),E(21,`div`,11),Ne$1(22,`ui-du-vs-classic-field-rule-set`,12),k()(),ee(23,Ca,3,3),E(24,`div`,13),ee(25,ya,1,4,`ui-du-vs-classic-table-value`,14)(26,Ma,3,1)(27,Da,3,1),k(),ee(28,Fa,7,8,`div`,15),k()(),ee(29,Ba,3,3,`mat-card`,16),k()()),e&2){let a,d=No(1,23,(a=n.assignHotkey())==null?null:a.combos,!1)??``;C(2);let u=qn$1(n.field());C();let S=qn$1(n.taxonomy()),J=n.isSelected();C();let tt=qn$1(S.type===n.TaxonomyDefinitionType.DocumentType);C(),ae(`data-testid`,tt?`doc-type-field`:`field`),C(2),ur(`border-left-color`,J?S.color:null),ge(`mat-elevation-z0-custom`,J)(`mat-elevation-z0`,!J),C(3),ur(`border-color`,J?S.color:`transparent`),C(),W(`hotkey`,d)(`bgColor`,S.color)(`tooltip`,No(12,29,n.assignHotkeyTooltip(),io$1(34,ma,d))),C(2),te(n.showCapabilitiesIcons()?13:-1),C(2),qe(` `,tt?U(16,32,`VS_DOCTYPE_LABEL`):S.name,` `),C(3),te(u.dataSource===n.ExtractionSource.Defaulted?18:!u.valueIds.length&&u.confirmationStatus===n.ConfirmationStatus.Confirmed?19:-1),C(2),te(n.hasSuggestions()&&u.type===n.ValueType.Field&&S.type===n.TaxonomyDefinitionType.Field?20:-1),C(2),W(`ruleSet`,S.type===n.TaxonomyDefinitionType.DocumentType?void 0:S.ruleSet),C(),te(S.type!==n.TaxonomyDefinitionType.DocumentType?23:-1),C(),ge(`full-height`,u.valueIds.length===1),C(),te(S.type===n.TaxonomyDefinitionType.Table&&u.type===n.ValueType.Table?25:S.type===n.TaxonomyDefinitionType.FieldGroup&&u.type===n.ValueType.FieldGroup?26:27),C(3),te(!n.readonly()&&S.type!==n.TaxonomyDefinitionType.DocumentType&&S.type!==n.TaxonomyDefinitionType.Table&&S.multiValued&&u.valueIds.length?28:-1),C(),te(n.suggestionsOpen()&&u.type===n.ValueType.Field&&S.type===n.TaxonomyDefinitionType.Field?29:-1)}},dependencies:[Xn$1,bn,xr,wi,On$1,jn$1,rR,tz,nz,a_t,QN,nve,sx,$v,wnt,m_e,Ee,ma$2,de,nn,gr,Qo$1,Dr,an,ha$1,en,Dt,O6],styles:[`.ui-field[_ngcontent-%COMP%]{display:flex;padding:4px 4px 4px 8px;transition:background-color .2s cubic-bezier(.35,0,.25,1);background-color:var(--%NS%color-background)}.ui-field[_ngcontent-%COMP%]:hover{background-color:var(--%NS%color-background-hover)}.ui-field[_ngcontent-%COMP%]   .header-container[_ngcontent-%COMP%]{display:flex;justify-content:space-between;align-items:center;color:var(--%NS%color-foreground)}.ui-field[_ngcontent-%COMP%]   .header-container[_ngcontent-%COMP%]   .name-container[_ngcontent-%COMP%]{display:flex;flex:1 0 155px;flex-wrap:wrap;min-height:40px;margin-right:4px;box-sizing:border-box;align-items:center;font-weight:500;border-left:4px solid;white-space:nowrap}.ui-field[_ngcontent-%COMP%]   .header-container[_ngcontent-%COMP%]   .name-container[_ngcontent-%COMP%]   .ui-hotkey-box[_ngcontent-%COMP%]{margin-left:8px;margin-right:12px}.ui-field[_ngcontent-%COMP%]   .header-container[_ngcontent-%COMP%]   .name-container[_ngcontent-%COMP%]   .validated-chip[_ngcontent-%COMP%]{font-size:var(--%NS%apollo-font-s-size)}.ui-field[_ngcontent-%COMP%]   .header-container[_ngcontent-%COMP%]   .name-container[_ngcontent-%COMP%]   .mdc-evolution-chip-set__chips[_ngcontent-%COMP%]{flex-wrap:nowrap}.ui-field[_ngcontent-%COMP%]   .header-container[_ngcontent-%COMP%]   .name-container[_ngcontent-%COMP%]   .edit-reference-capabilities-icon[_ngcontent-%COMP%]{display:flex;flex-direction:row-reverse;margin-right:5px}.ui-field[_ngcontent-%COMP%]   .header-container[_ngcontent-%COMP%]   .name-container[_ngcontent-%COMP%]   .edit-reference-capabilities-icon[_ngcontent-%COMP%] > .mat-icon[_ngcontent-%COMP%]{height:var(--%NS%apollo-icon-xs);width:var(--%NS%apollo-icon-xs);font-size:var(--%NS%apollo-icon-xs);display:block;padding:var(--%NS%apollo-pad-s);cursor:help;border:2px solid transparent;border-radius:50%;background:var(--%NS%color-background-secondary);border-color:var(--%NS%color-border-de-emp)}.ui-field[_ngcontent-%COMP%]   .header-container[_ngcontent-%COMP%]   .name-container[_ngcontent-%COMP%]   .edit-reference-capabilities-icon[_ngcontent-%COMP%] > .mat-icon[_ngcontent-%COMP%]:not(:first-child){margin-right:-5px}.ui-field[_ngcontent-%COMP%]   .header-container[_ngcontent-%COMP%]   .name-container[_ngcontent-%COMP%]   .edit-reference-capabilities-icon[_ngcontent-%COMP%] > .mat-icon[_ngcontent-%COMP%]:hover{transform:scale(1.1)}.ui-field[_ngcontent-%COMP%]   .header-container[_ngcontent-%COMP%]   .name-container[_ngcontent-%COMP%]   .field-name[_ngcontent-%COMP%]{margin-right:10px}.ui-field[_ngcontent-%COMP%]   .header-container[_ngcontent-%COMP%]   .name-container[_ngcontent-%COMP%]   .field-suggestion-count[_ngcontent-%COMP%]{margin-right:2px}.ui-field[_ngcontent-%COMP%]   .header-container[_ngcontent-%COMP%]   .tail-container[_ngcontent-%COMP%]{display:flex;align-items:center}.ui-field[_ngcontent-%COMP%]   .validator-notes[_ngcontent-%COMP%]{width:100%}.ui-field[_ngcontent-%COMP%]   .data-point[_ngcontent-%COMP%]{flex-grow:1}.ui-field[_ngcontent-%COMP%]   .data-point[_ngcontent-%COMP%]   .mat-mdc-card.field-card[_ngcontent-%COMP%]{width:100%;border:0 none;background-color:transparent}.ui-field[_ngcontent-%COMP%]   .data-point[_ngcontent-%COMP%]   .mat-mdc-card.field-card[_ngcontent-%COMP%] > .mat-mdc-card-content[_ngcontent-%COMP%]{padding:0}.ui-field[_ngcontent-%COMP%]   .data-point[_ngcontent-%COMP%]   .mat-mdc-card.field-card.field-suggestions-card[_ngcontent-%COMP%]{margin-top:-.5em;margin-left:4px;max-height:230px;overflow-y:auto;max-width:calc(100% - 39px);box-shadow:0 11px 15px -7px #0003,0 24px 38px 3px #00000024,0 9px 46px 8px #0000001f}.ui-field[_ngcontent-%COMP%]   .data-point[_ngcontent-%COMP%]   .manual-extraction-tools[_ngcontent-%COMP%]{display:flex;justify-content:flex-end;padding:0 4px}.ui-field[_ngcontent-%COMP%]   .mat-elevation-z0-custom[_ngcontent-%COMP%]{box-shadow:0 2px 1px #0003}.ui-field[_ngcontent-%COMP%]   .add-value[_ngcontent-%COMP%]{display:flex;justify-content:flex-end}`]})}return i})();var Ua=[`fieldsContainer`];var sn=i=>({selectedThreshold:i});var za=(i,r)=>({notConfirmedFields:i,notConfirmedTables:r});var Xa=i=>({notConfirmedFields:i});var Ha=i=>({notConfirmedTables:i});var Oe=(i,r)=>r.id;function ja(i,r){if(i&1){let t=nt();E(0,`div`,2),Ne$1(1,`ui-du-vs-classic-confidence-switch`),E(2,`ui-threshold-picker`,5),V(3,`translate`),X(`valueChange`,function(n){Ce$1(t);return xe(P().onConfidenceThresholdChange(n))}),k()()}if(i&2){let t=P();C(2),W(`tooltip`,U(3,2,`VS_EXTRACTION_RESULTS_CONFIDENCE_THRESHOLD_TOOLTIP`))(`value`,t.confidenceThresholdValue())}}function Wa(i,r){if(i&1&&Ne$1(0,`ui-du-vs-classic-field`,6),i&2){let t=P(2);W(`field`,t.documentTypeField())(`readonly`,t.readonly()),ae(`data-field-id`,t.documentTypeField().id)}}function Ga(i,r){if(i&1&&Ne$1(0,`ui-du-vs-classic-field`,15),i&2){let t=r.$implicit,e=r.$index,n=P(3);W(`field`,t)(`readonly`,n.readonly()),ae(`data-testid`,`invalid_field_`+e+`_`+t.fieldId)(`data-field-id`,t.id)}}function $a(i,r){if(i&1&&Hn$1(0,Ga,1,4,`ui-du-vs-classic-field`,15,Oe),i&2)Un$1(P(2).groupingFieldsService.invalidFields())}function Qa(i,r){if(i&1&&Ne$1(0,`ui-du-vs-classic-field`,15),i&2){let t=r.$implicit,e=r.$index,n=P(3);W(`field`,t)(`readonly`,n.readonly()),ae(`data-testid`,`valid_field_`+e+`_`+t.fieldId)(`data-field-id`,t.id)}}function qa(i,r){if(i&1&&Hn$1(0,Qa,1,4,`ui-du-vs-classic-field`,15,Oe),i&2)Un$1(P(2).groupingFieldsService.validFields())}function Ka(i,r){if(i&1){let t=nt();ee(0,Wa,1,3,`ui-du-vs-classic-field`,6),E(1,`mat-accordion`,7)(2,`mat-expansion-panel`,8),X(`opened`,function(){Ce$1(t);return xe(P().invalidGroupExpanded.set(!0))})(`closed`,function(){Ce$1(t);return xe(P().invalidGroupExpanded.set(!1))}),E(3,`mat-expansion-panel-header`,9),V(4,`translate`),E(5,`mat-panel-title`,10)(6,`span`),H(7),V(8,`translate`),k(),Ne$1(9,`ui-du-vs-classic-expand-icon`,11),k()(),mn$1(10,$a,2,0,`ng-template`,12),k(),E(11,`mat-expansion-panel`,13),X(`opened`,function(){Ce$1(t);return xe(P().validGroupExpanded.set(!0))})(`closed`,function(){Ce$1(t);return xe(P().validGroupExpanded.set(!1))}),E(12,`mat-expansion-panel-header`,14),V(13,`translate`),E(14,`mat-panel-title`,10)(15,`span`),H(16),V(17,`translate`),k(),Ne$1(18,`ui-du-vs-classic-expand-icon`,11),k()(),mn$1(19,qa,2,0,`ng-template`,12),k()()}if(i&2){let t=P();te(t.documentTypeField()?0:-1),C(2),W(`expanded`,t.invalidGroupExpanded()),C(),W(`matTooltip`,No(4,11,t.invalidFieldsTooltip(),io$1(21,sn,t.confidenceThresholdValue()))),C(4),$s(``,U(8,14,`VS_EXTRACTION_RESULTS_INVALID_FIELDS_GROUP_TITLE`),` (`,t.groupingFieldsService.invalidFields().length,`)`),C(2),W(`expanded`,t.invalidGroupExpanded()),C(2),W(`expanded`,t.validGroupExpanded()),C(),W(`matTooltip`,No(13,16,t.validFieldsTooltip(),io$1(23,sn,t.confidenceThresholdValue()))),C(4),$s(``,U(17,19,`VS_EXTRACTION_RESULTS_VALID_FIELDS_GROUP_TITLE`),` (`,t.groupingFieldsService.validFields().length,`)`),C(2),W(`expanded`,t.validGroupExpanded())}}function Ya(i,r){if(i&1&&Ne$1(0,`ui-du-vs-classic-field`,15),i&2){let t=r.$implicit,e=r.$index,n=P(2),a=t.fieldId===n.documentTypeTaxonomy()?.id,d=n.shouldHideDocumentTypeField()?e:e-1,u=a?`doc-type-field`:`field`+d;ge(`document-type-field`,a),W(`field`,t)(`readonly`,n.readonly()),ae(`data-testid`,u)(`data-field-id`,t.id)}}function Za(i,r){if(i&1&&Hn$1(0,Ya,1,6,`ui-du-vs-classic-field`,16,Oe),i&2)Un$1(P().fieldValuesToRender())}function Ja(i,r){i&1&&(E(0,`span`,24),H(1,`VS_EXTRACTION_RESULTS_MAIN_SAVEDRAFT_LOADING_STATE_BUTTON`),k())}function to(i,r){i&1&&(E(0,`span`,24),H(1,`VS_EXTRACTION_RESULTS_MAIN_SAVEDRAFT_BUTTON`),k())}function eo(i,r){if(i&1){let t=nt();E(0,`button`,23),V(1,`translate`),V(2,`uiHotkeysComboDisplay`),X(`click`,function(){Ce$1(t);return xe(P(3).onSave())}),ee(3,Ja,2,0,`span`,24)(4,to,2,0,`span`,24),k()}if(i&2){let t,e=P(3),n=e.saveMode()===e.SavingState.ASDRAFT&&e.isSaving();W(`matTooltip`,va$1(``,U(1,6,`VS_EXTRACTION_RESULTS_MAIN_SAVEDRAFT_BUTTON_TOOLTIP`),` `,U(2,8,(t=e.saveAsDraftExtractionResultsShortcut())==null?null:t.combos)))(`disabled`,!e.canSave())(`progressButtonLoading`,n),C(3),te(n?3:4)}}function io(i,r){i&1&&(E(0,`span`,24),H(1,`VS_EXTRACTION_RESULTS_MAIN_SAVE_LOADING_STATE_BUTTON`),k())}function no(i,r){i&1&&(E(0,`span`,24),H(1,`VS_EXTRACTION_RESULTS_MAIN_SAVE_BUTTON`),k())}function ao(i,r){if(i&1){let t=nt();ei(0),V(1,`translate`),V(2,`translate`),V(3,`uiHotkeysComboDisplay`),E(4,`div`)(5,`button`,25),X(`click`,function(){Ce$1(t);return xe(P(3).onSubmit())}),ee(6,io,2,0,`span`,24)(7,no,2,0,`span`,24),k()()}if(i&2){let t,e=P(3),n=e.hasInvalidRules()?U(1,4,`VS_SAVE_BUSINESS_RULES_VALIDATION_ERROR`):U(2,6,`VS_EXTRACTION_RESULTS_MAIN_SAVE_BUTTON_TOOLTIP`)+` `+U(3,8,(t=e.saveExtractionResultsShortcut())==null?null:t.combos),a=e.saveMode()===e.SavingState.SUBMIT&&e.isSaving();C(5),W(`matTooltip`,n)(`disabled`,!e.canSave()||e.hasInvalidRules())(`progressButtonLoading`,a),C(),te(a?6:7)}}function oo(i,r){if(i&1){let t=nt();E(0,`button`,26),V(1,`translate`),V(2,`uiHotkeysComboDisplay`),X(`click`,function(){Ce$1(t);return xe(P(3).onReportException())}),H(3,` ! `),k()}if(i&2){let t,e=P(3);W(`matTooltip`,va$1(``,U(1,4,`VS_EXTRACTION_RESULTS_REPORT_DOCUMENT_AS_EXCEPTION_TOOLTIP`),` `,U(2,6,(t=e.reportDocumentAsExceptionShortcut())==null?null:t.combos)))(`disabled`,e.isSaving()||e.isFormattingDerivedParts())}}function so(i,r){if(i&1){let t=nt();E(0,`div`,17)(1,`button`,19),V(2,`translate`),V(3,`uiHotkeysComboDisplay`),X(`click`,function(){Ce$1(t);return xe(P(2).onDiscardChanges())}),H(4),V(5,`translate`),k(),E(6,`div`,20),ee(7,eo,5,10,`button`,21),ee(8,ao,8,10,`div`),k(),ee(9,oo,4,8,`button`,22),k()}if(i&2){let t,e=P(2);C(),W(`matTooltip`,va$1(``,U(2,8,`VS_EXTRACTION_RESULTS_DISCARD_CHANGES_TOOLTIP`),` `,U(3,10,(t=e.discardChangesShortcut())==null?null:t.combos)))(`disabled`,!e.canDiscardChanges()),C(3),qe(` `,U(5,12,`VS_EXTRACTION_RESULT_DISCARD_CHANGES_BUTTON`),` `),C(3),te(e.enableSaveAsDraft()?7:-1),C(),te(e.options().hideSubmitButton?-1:8),C(),te(!e.options().hideReportAsExceptionButton&&e.isReportExceptionAllowed()?9:-1)}}function ro(i,r){if(i&1&&(H(0),V(1,`translate`)),i&2){let t=P(3);qe(` `,No(1,1,`VS_EXTRACTION_RESULTS_UNCONFIRMED_REGULAR_AND_TABLE_FIELDS_DECIDE_MESSAGE`,ro$1(4,za,t.numberOfUnconfirmedRegularValues(),t.numberOfUnconfirmedTableValues())),` `)}}function lo(i,r){if(i&1&&(H(0),V(1,`translate`)),i&2)qe(` `,No(1,1,`VS_EXTRACTION_RESULTS_UNCONFIRMED_REGULAR_FIELDS_DECIDE_MESSAGE`,io$1(4,Xa,P(3).numberOfUnconfirmedRegularValues())),` `)}function co(i,r){if(i&1&&(H(0),V(1,`translate`)),i&2)qe(` `,No(1,1,`VS_EXTRACTION_RESULTS_UNCONFIRMED_TABLE_FIELDS_DECIDE_MESSAGE`,io$1(4,Ha,P(3).numberOfUnconfirmedTableValues())),` `)}function mo(i,r){if(i&1){let t=nt();E(0,`div`,18)(1,`div`,27)(2,`span`),ee(3,ro,2,7)(4,lo,2,6)(5,co,2,6),k(),E(6,`span`,24),H(7,` VS_EXTRACTION_RESULTS_UNCONFIRMED_FIELDS_CONTINUE_QUESTION `),k()(),E(8,`div`,28)(9,`button`,29),X(`click`,function(){Ce$1(t);return xe(P(2).onContinueAndSave())}),H(10),V(11,`translate`),k(),E(12,`button`,30),X(`click`,function(){Ce$1(t);return xe(P(2).onCancelDecisionMode())}),H(13),V(14,`translate`),k()()()}if(i&2){let t=P(2);C(3),te(t.numberOfUnconfirmedRegularValues()>0&&t.numberOfUnconfirmedTableValues()>0?3:t.numberOfUnconfirmedRegularValues()>0?4:t.numberOfUnconfirmedTableValues()>0?5:-1),C(7),qe(` `,U(11,3,`VS_EXTRACTION_RESULTS_CONTINUE_AND_SAVE_BUTTON`),` `),C(3),qe(` `,U(14,5,`VS_EXTRACTION_RESULTS_NO_CONTINUE_BUTTON`),` `)}}function _o(i,r){if(i&1&&(E(0,`div`,4),ee(1,so,10,14,`div`,17)(2,mo,15,7,`div`,18),k()),i&2){let t=P();C(),te(t.isInDecidingMode()?2:1)}}function po(i,r){i&1&&Ne$1(0,`ui-du-vs-readonly-footer`,31)}function ho(i,r){if(i&1&&ee(0,po,1,0,`ui-du-vs-readonly-footer`,31),i&2)te(P().shouldHideReadonlyModeIndicator()?-1:0)}var Fl=(()=>{class i extends Ug{_stateService=p(VD);_injector=p(Xe);groupingFieldsService=p(Ne);_fieldsContainer=Ci(`fieldsContainer`);isConfidenceAllowed=z$1(()=>this._configurationManagerService.globalCustomizations().isConfidenceAllowed);confidenceThresholdValue=z$1(()=>this._stateService.confidenceThreshold());documentTypeField=z$1(()=>{let t=this._extractionManagerService.selectedDocumentTypeId();return!t||this.shouldHideDocumentTypeField()?null:this._extractionManagerService.getById(t)});invalidGroupExpanded=pe(!0);validGroupExpanded=pe(!1);invalidFieldsTooltip=z$1(()=>this.groupingFieldsService.effectiveConfidenceThreshold()>0?`VS_EXTRACTION_RESULTS_INVALID_FIELDS_GROUP_TOOLTIP`:`VS_EXTRACTION_RESULTS_WITH_INVALID_RULES_FIELDS_GROUP_TOOLTIP`);validFieldsTooltip=z$1(()=>this.groupingFieldsService.effectiveConfidenceThreshold()>0?`VS_EXTRACTION_RESULTS_VALID_FIELDS_WITH_CONFIDENCE_GROUP_TOOLTIP`:`VS_EXTRACTION_RESULTS_VALID_FIELDS_GROUP_TOOLTIP`);_selectedFieldGroup=z$1(()=>this.groupingFieldsService.groupOf(this._selectedTopLevelFieldId()));_selectedTopLevelFieldId=z$1(()=>{let t=this._extractionManagerService.selectedValueId();if(!t)return null;let e=this._extractionManagerService.selectedDocumentTypeId();if(!e)return null;let n=t;for(let a=0;a<10;a++){let d=this._extractionManagerService.getById(n);if(!d)return null;if(d.parentId===e)return n;if(n=d.parentId,!n)return null}return null});constructor(){super(),Ut(()=>{if(this._stateService.confidenceThresholdSeeded)return;let t=this._configurationManagerService.customizationsStatus().loaded,e=this._configurationManagerService.globalCustomizations();t&&St(()=>{if(!e.isConfidenceAllowed)return;let n=e.fieldsValidationConfidence;if(n==null||n<=0)return;this._stateService.confidenceThresholdSeeded=!0;let a=Math.min(1,Math.max(0,n/100));this._stateService.confidenceThreshold.set(a)})}),Ut(()=>{let t=this._selectedFieldGroup();t===`invalid`?this.invalidGroupExpanded.set(!0):t===`valid`&&this.validGroupExpanded.set(!0)}),Ut(t=>{let e=this._selectedTopLevelFieldId();this._selectedFieldGroup(),e&&St(()=>{let n=Ln$1(()=>this.scrollFieldIntoView(e),{injector:this._injector});t(()=>n.destroy())})})}scrollFieldIntoView(t){this._fieldsContainer()?.nativeElement?.querySelector(`[data-field-id="${t}"]`)?.scrollIntoView({block:`nearest`,inline:`nearest`})}onConfidenceThresholdChange(t){this._stateService.confidenceThreshold.set(t)}onSave(){this._extractionManagerService.removeEmptyTableRows(),super.onSave()}onSubmit(){this._extractionManagerService.removeEmptyTableRows(),super.onSubmit()}_buildNavigableFieldValueIds(){let t=this.documentTypeField();return[...t?this._getNavigableValueIds(t):[],...this.groupingFieldsService.invalidFields().flatMap(e=>this._getNavigableValueIds(e)),...this.groupingFieldsService.validFields().flatMap(e=>this._getNavigableValueIds(e))]}static ɵfac=function(e){return new(e||i)};static ɵcmp=J({type:i,selectors:[[`ui-du-vs-classic-fields-form`]],viewQuery:function(e,n){e&1&&Ar(n._fieldsContainer,Ua,5),e&2&&Nr()},features:[bt([Ne]),wt],decls:8,vars:3,consts:[[`fieldsContainer`,``],[`automation-id`,`fields-container`,`data-testid`,`fields-container`,1,`ui-fields-form`,3,`submit`],[`automation-id`,`confidence-filtering-container`,`data-testid`,`confidence-filtering-container`,1,`confidence-container`],[1,`fields`],[1,`footer`],[3,`valueChange`,`tooltip`,`value`],[`data-testid`,`doc-type-field`,1,`document-type-field`,3,`field`,`readonly`],[`multi`,`true`],[`hideToggle`,``,`data-testid`,`invalid-fields-group`,1,`fields-group-panel`,3,`opened`,`closed`,`expanded`],[`data-testid`,`invalid-fields-panel-header`,3,`matTooltip`],[1,`group-panel-title`],[3,`expanded`],[`matExpansionPanelContent`,``],[`hideToggle`,``,`data-testid`,`valid-fields-group`,1,`fields-group-panel`,3,`opened`,`closed`,`expanded`],[`data-testid`,`valid-fields-panel-header`,3,`matTooltip`],[3,`field`,`readonly`],[3,`document-type-field`,`field`,`readonly`],[1,`buttons`],[`data-testid`,`decide-unconfirmed-fields`,1,`decide-unconfirmed-fields`],[`mat-button`,``,`data-testid`,`btn-discard-changes`,1,`discard`,`btn-small`,3,`click`,`matTooltip`,`disabled`],[1,`save-buttons`],[`ui-progress-button`,``,`mat-stroked-button`,``,`color`,`secondary`,`data-testid`,`save-as-draft-button`,1,`save-as-draft`,`btn-small`,3,`matTooltip`,`disabled`,`progressButtonLoading`],[`mat-flat-button`,``,`data-testid`,`report-exception-button`,`color`,`warn`,1,`report`,`btn-small`,3,`matTooltip`,`disabled`],[`ui-progress-button`,``,`mat-stroked-button`,``,`color`,`secondary`,`data-testid`,`save-as-draft-button`,1,`save-as-draft`,`btn-small`,3,`click`,`matTooltip`,`disabled`,`progressButtonLoading`],[`translate`,``],[`ui-progress-button`,``,`mat-flat-button`,``,`color`,`primary`,`data-testid`,`save-button`,`type`,`button`,1,`save`,`btn-small`,3,`click`,`matTooltip`,`disabled`,`progressButtonLoading`],[`mat-flat-button`,``,`data-testid`,`report-exception-button`,`color`,`warn`,1,`report`,`btn-small`,3,`click`,`matTooltip`,`disabled`],[`data-testid`,`decide-message`,1,`decide-message`],[1,`decide-buttons`],[`mat-flat-button`,``,`color`,`primary`,`data-testid`,`continue-and-save`,1,`btn-small`,3,`click`],[`mat-flat-button`,``,`color`,`warn`,`data-testid`,`cancel-save`,1,`btn-small`,3,`click`],[1,`classic`]],template:function(e,n){e&1&&(E(0,`form`,1),X(`submit`,function(d){return d.preventDefault()}),ee(1,ja,4,4,`div`,2),E(2,`div`,3,0),ee(4,Ka,20,25)(5,Za,2,0),k(),ee(6,_o,3,1,`div`,4)(7,ho,1,1),k()),e&2&&(C(),te(n.isConfidenceAllowed()?1:-1),C(3),te(n.groupingFieldsService.isGroupingActive()?4:5),C(2),te(n.readonly()?7:6))},dependencies:[On$1,xi,Da$1,Ap,Vt$1,an$2,Ia$1,Xr,xr,wi,ym,vx,_x,Ne$2,Zi,ke,on,_a$1,Dt,O6],styles:[`[_nghost-%COMP%]{height:100%}.ui-fields-form[_ngcontent-%COMP%]{height:100%;display:flex;flex-direction:column}.ui-fields-form[_ngcontent-%COMP%]   .confidence-container[_ngcontent-%COMP%]{display:flex;justify-content:space-between;padding-top:var(--%NS%apollo-pad-m);padding-bottom:var(--%NS%apollo-pad-m);white-space:nowrap;flex-wrap:wrap}.ui-fields-form[_ngcontent-%COMP%]   .confidence-container[_ngcontent-%COMP%]   ui-threshold-picker[_ngcontent-%COMP%]{margin-left:15px}.ui-fields-form[_ngcontent-%COMP%]   .fields[_ngcontent-%COMP%]{flex-grow:1;overflow-y:auto;background-color:var(--%NS%color-background-secondary);display:flex;flex-direction:column;gap:4px;scrollbar-gutter:stable}.ui-fields-form[_ngcontent-%COMP%]   .fields[_ngcontent-%COMP%]   .document-type-field[_ngcontent-%COMP%]{margin-bottom:12px}.ui-fields-form[_ngcontent-%COMP%]   .fields[_ngcontent-%COMP%]   .ui-alert-bar[_ngcontent-%COMP%]{margin:4px 4px 4px 8px}.ui-fields-form[_ngcontent-%COMP%]   .fields[_ngcontent-%COMP%]   .fields-group-panel[_ngcontent-%COMP%]{border-radius:0!important;box-shadow:none!important;border-top:1px solid var(--%NS%color-border)}.ui-fields-form[_ngcontent-%COMP%]   .fields[_ngcontent-%COMP%]   .fields-group-panel[_ngcontent-%COMP%]     .mat-expansion-panel-header{height:48px;background-color:var(--%NS%color-background-selected)!important;color:var(--%NS%color-foreground);font-weight:500;padding:0 16px}.ui-fields-form[_ngcontent-%COMP%]   .fields[_ngcontent-%COMP%]   .fields-group-panel[_ngcontent-%COMP%]     .mat-expansion-panel-header:hover{background-color:var(--%NS%color-background-hover)!important}.ui-fields-form[_ngcontent-%COMP%]   .fields[_ngcontent-%COMP%]   .fields-group-panel[_ngcontent-%COMP%]     .mat-expansion-panel-header .mat-expansion-panel-header-title{color:var(--%NS%color-foreground);margin-right:0}.ui-fields-form[_ngcontent-%COMP%]   .fields[_ngcontent-%COMP%]   .fields-group-panel[_ngcontent-%COMP%]     .mat-expansion-panel-body{padding:0}.ui-fields-form[_ngcontent-%COMP%]   .fields[_ngcontent-%COMP%]   .fields-group-panel[_ngcontent-%COMP%]     .mat-expansion-panel-content{font-size:inherit}.ui-fields-form[_ngcontent-%COMP%]   .fields[_ngcontent-%COMP%]   .fields-group-panel[_ngcontent-%COMP%]   .group-panel-title[_ngcontent-%COMP%]{display:flex;justify-content:center;align-items:center;width:100%}.ui-fields-form[_ngcontent-%COMP%]   .footer[_ngcontent-%COMP%]{display:flex;align-items:center;flex-wrap:wrap;border-top-width:1.2px;border-top-style:solid;border-top-color:var(--%NS%color-border);padding:10px 20px;color:var(--%NS%color-foreground)}.ui-fields-form[_ngcontent-%COMP%]   .footer[_ngcontent-%COMP%]   .ui-select[_ngcontent-%COMP%]   .mat-mdc-form-field[_ngcontent-%COMP%]{font-size:var(--%NS%apollo-font-m-size);max-width:85px}.ui-fields-form[_ngcontent-%COMP%]   .footer[_ngcontent-%COMP%]   .mat-icon[_ngcontent-%COMP%]{color:var(--%NS%color-foreground-secondary)}.ui-fields-form[_ngcontent-%COMP%]   .footer[_ngcontent-%COMP%]   .buttons[_ngcontent-%COMP%]{display:flex;flex-grow:1;justify-content:flex-end;gap:10px;align-items:center}.ui-fields-form[_ngcontent-%COMP%]   .footer[_ngcontent-%COMP%]   .buttons[_ngcontent-%COMP%]   .report[_ngcontent-%COMP%]{min-width:37px}.ui-fields-form[_ngcontent-%COMP%]   .footer[_ngcontent-%COMP%]   .buttons[_ngcontent-%COMP%]   .save-buttons[_ngcontent-%COMP%]{display:flex;gap:10px}.ui-fields-form[_ngcontent-%COMP%]   .footer[_ngcontent-%COMP%]   .buttons[_ngcontent-%COMP%]   .save-buttons[_ngcontent-%COMP%]   .save[_ngcontent-%COMP%], .ui-fields-form[_ngcontent-%COMP%]   .footer[_ngcontent-%COMP%]   .buttons[_ngcontent-%COMP%]   .save-buttons[_ngcontent-%COMP%]   .save-as-draft[_ngcontent-%COMP%]{min-width:95px}.ui-fields-form[_ngcontent-%COMP%]   .footer[_ngcontent-%COMP%]   .decide-unconfirmed-fields[_ngcontent-%COMP%]{display:flex;flex-wrap:nowrap;width:100%}.ui-fields-form[_ngcontent-%COMP%]   .footer[_ngcontent-%COMP%]   .decide-unconfirmed-fields[_ngcontent-%COMP%]   .decide-message[_ngcontent-%COMP%]{display:flex;flex-direction:column;flex-grow:1;align-items:flex-end;margin-right:20px;text-align:right;color:var(--%NS%color-foreground)}.ui-fields-form[_ngcontent-%COMP%]   .footer[_ngcontent-%COMP%]   .decide-unconfirmed-fields[_ngcontent-%COMP%]   .decide-message[_ngcontent-%COMP%] > span[_ngcontent-%COMP%]:first-child{font-size:var(--%NS%apollo-font-xs-size)}.ui-fields-form[_ngcontent-%COMP%]   .footer[_ngcontent-%COMP%]   .decide-unconfirmed-fields[_ngcontent-%COMP%]   .decide-message[_ngcontent-%COMP%] > span[_ngcontent-%COMP%]:nth-child(2){font-size:var(--%NS%apollo-font-s-size)}.ui-fields-form[_ngcontent-%COMP%]   .footer[_ngcontent-%COMP%]   .decide-unconfirmed-fields[_ngcontent-%COMP%]   .decide-buttons[_ngcontent-%COMP%]{display:flex;justify-content:flex-end;align-items:center}.ui-fields-form[_ngcontent-%COMP%]   .footer[_ngcontent-%COMP%]   .decide-unconfirmed-fields[_ngcontent-%COMP%]   .decide-buttons[_ngcontent-%COMP%]   .mat-icon[_ngcontent-%COMP%]{color:inherit}.ui-fields-form[_ngcontent-%COMP%]   .footer[_ngcontent-%COMP%]   .decide-unconfirmed-fields[_ngcontent-%COMP%]   .decide-buttons[_ngcontent-%COMP%]   .mat-mdc-unelevated-button[_ngcontent-%COMP%]:nth-child(2){margin-left:10px}.ui-fields-form[_ngcontent-%COMP%]   .footer[_ngcontent-%COMP%]   .discard[_ngcontent-%COMP%]{color:var(--%NS%color-foreground)}.ui-fields-form[_ngcontent-%COMP%]   .footer[_ngcontent-%COMP%]   .discard[disabled][_ngcontent-%COMP%]{color:var(--%NS%color-foreground-disable)}`]})}return i})();export{Fl as VsClassicFieldsFormComponent};