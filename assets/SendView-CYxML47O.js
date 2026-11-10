import{$ as e,G as t,J as n,M as r,Mt as i,P as a,Q as o,R as s,Rt as c,St as l,V as u,W as d,Z as f,c as p,ct as m,dt as h,en as g,et as _,ht as v,i as y,ot as b,t as x}from"./api-nTf4EaU5.js";import{a as S,c as C,l as w}from"./index-Cpo_JqhT.js";import{n as T,t as E}from"./WaveBottom-Abb6tQdP.js";var D={name:`BaseInput`,extends:{name:`BaseEditableHolder`,extends:p,emits:[`update:modelValue`,`value-change`],props:{modelValue:{type:null,default:void 0},defaultValue:{type:null,default:void 0},name:{type:String,default:void 0},invalid:{type:Boolean,default:void 0},disabled:{type:Boolean,default:!1},formControl:{type:Object,default:void 0}},inject:{$parentInstance:{default:void 0},$pcForm:{default:void 0},$pcFormField:{default:void 0}},data:function(){return{d_value:this.defaultValue===void 0?this.modelValue:this.defaultValue}},watch:{modelValue:{deep:!0,handler:function(e){this.d_value=e}},defaultValue:function(e){this.d_value=e},$formName:{immediate:!0,handler:function(e){var t,n;this.formField=((t=this.$pcForm)==null||(n=t.register)==null?void 0:n.call(t,e,this.$formControl))||{}}},$formControl:{immediate:!0,handler:function(e){var t,n;this.formField=((t=this.$pcForm)==null||(n=t.register)==null?void 0:n.call(t,this.$formName,e))||{}}},$formDefaultValue:{immediate:!0,handler:function(e){this.d_value!==e&&(this.d_value=e)}},$formValue:{immediate:!1,handler:function(e){var t;(t=this.$pcForm)!=null&&t.getFieldState(this.$formName)&&e!==this.d_value&&(this.d_value=e)}}},formField:{},methods:{writeValue:function(e,t){var n,r;this.controlled&&(this.d_value=e,this.$emit(`update:modelValue`,e)),this.$emit(`value-change`,e),(n=(r=this.formField).onChange)==null||n.call(r,{originalEvent:t,value:e})},findNonEmpty:function(){return[...arguments].find(s)}},computed:{$filled:function(){return s(this.d_value)},$invalid:function(){var e,t;return!this.$formNovalidate&&this.findNonEmpty(this.invalid,(e=this.$pcFormField)==null||(e=e.$field)==null?void 0:e.invalid,(t=this.$pcForm)==null||(t=t.getFieldState(this.$formName))==null?void 0:t.invalid)},$formName:function(){return this.$formNovalidate?void 0:this.name||this.$formControl?.name},$formControl:function(){return this.formControl||this.$pcFormField?.formControl},$formNovalidate:function(){return this.$formControl?.novalidate},$formDefaultValue:function(){var e;return this.findNonEmpty(this.d_value,this.$pcFormField?.initialValue,(e=this.$pcForm)==null||(e=e.initialValues)==null?void 0:e[this.$formName])},$formValue:function(){var e,t;return this.findNonEmpty((e=this.$pcFormField)==null||(e=e.$field)==null?void 0:e.value,(t=this.$pcForm)==null||(t=t.getFieldState(this.$formName))==null?void 0:t.value)},controlled:function(){return this.$inProps.hasOwnProperty(`modelValue`)||!this.$inProps.hasOwnProperty(`modelValue`)&&!this.$inProps.hasOwnProperty(`defaultValue`)},filled:function(){return this.$filled}}},props:{size:{type:String,default:null},fluid:{type:Boolean,default:null},variant:{type:String,default:null}},inject:{$parentInstance:{default:void 0},$pcFluid:{default:void 0}},computed:{$variant:function(){return this.variant??(this.$primevue.config.inputStyle||this.$primevue.config.inputVariant)},$fluid:function(){return this.fluid??!!this.$pcFluid},hasFluid:function(){return this.$fluid}}},O=a.extend({name:`textarea`,style:`
    .p-textarea {
        font-family: inherit;
        font-feature-settings: inherit;
        font-size: 1rem;
        color: dt('textarea.color');
        background: dt('textarea.background');
        padding-block: dt('textarea.padding.y');
        padding-inline: dt('textarea.padding.x');
        border: 1px solid dt('textarea.border.color');
        transition:
            background dt('textarea.transition.duration'),
            color dt('textarea.transition.duration'),
            border-color dt('textarea.transition.duration'),
            outline-color dt('textarea.transition.duration'),
            box-shadow dt('textarea.transition.duration');
        appearance: none;
        border-radius: dt('textarea.border.radius');
        outline-color: transparent;
        box-shadow: dt('textarea.shadow');
    }

    .p-textarea:enabled:hover {
        border-color: dt('textarea.hover.border.color');
    }

    .p-textarea:enabled:focus {
        border-color: dt('textarea.focus.border.color');
        box-shadow: dt('textarea.focus.ring.shadow');
        outline: dt('textarea.focus.ring.width') dt('textarea.focus.ring.style') dt('textarea.focus.ring.color');
        outline-offset: dt('textarea.focus.ring.offset');
    }

    .p-textarea.p-invalid {
        border-color: dt('textarea.invalid.border.color');
    }

    .p-textarea.p-variant-filled {
        background: dt('textarea.filled.background');
    }

    .p-textarea.p-variant-filled:enabled:hover {
        background: dt('textarea.filled.hover.background');
    }

    .p-textarea.p-variant-filled:enabled:focus {
        background: dt('textarea.filled.focus.background');
    }

    .p-textarea:disabled {
        opacity: 1;
        background: dt('textarea.disabled.background');
        color: dt('textarea.disabled.color');
    }

    .p-textarea::placeholder {
        color: dt('textarea.placeholder.color');
    }

    .p-textarea.p-invalid::placeholder {
        color: dt('textarea.invalid.placeholder.color');
    }

    .p-textarea-fluid {
        width: 100%;
    }

    .p-textarea-resizable {
        overflow: hidden;
        resize: none;
    }

    .p-textarea-sm {
        font-size: dt('textarea.sm.font.size');
        padding-block: dt('textarea.sm.padding.y');
        padding-inline: dt('textarea.sm.padding.x');
    }

    .p-textarea-lg {
        font-size: dt('textarea.lg.font.size');
        padding-block: dt('textarea.lg.padding.y');
        padding-inline: dt('textarea.lg.padding.x');
    }
`,classes:{root:function(e){var t=e.instance,n=e.props;return[`p-textarea p-component`,{"p-filled":t.$filled,"p-textarea-resizable ":n.autoResize,"p-textarea-sm p-inputfield-sm":n.size===`small`,"p-textarea-lg p-inputfield-lg":n.size===`large`,"p-invalid":t.$invalid,"p-variant-filled":t.$variant===`filled`,"p-textarea-fluid":t.$fluid}]}}}),k={name:`BaseTextarea`,extends:D,props:{autoResize:Boolean},style:O,provide:function(){return{$pcTextarea:this,$parentInstance:this}}};function A(e){"@babel/helpers - typeof";return A=typeof Symbol==`function`&&typeof Symbol.iterator==`symbol`?function(e){return typeof e}:function(e){return e&&typeof Symbol==`function`&&e.constructor===Symbol&&e!==Symbol.prototype?`symbol`:typeof e},A(e)}function j(e,t,n){return(t=M(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function M(e){var t=N(e,`string`);return A(t)==`symbol`?t:t+``}function N(e,t){if(A(e)!=`object`||!e)return e;var n=e[Symbol.toPrimitive];if(n!==void 0){var r=n.call(e,t);if(A(r)!=`object`)return r;throw TypeError(`@@toPrimitive must return a primitive value.`)}return(t===`string`?String:Number)(e)}var P={name:`Textarea`,extends:k,inheritAttrs:!1,observer:null,mounted:function(){var e=this;this.autoResize&&(this.observer=new ResizeObserver(function(){requestAnimationFrame(function(){e.resize()})}),this.observer.observe(this.$el))},updated:function(){this.autoResize&&this.resize()},beforeUnmount:function(){this.observer&&this.observer.disconnect()},methods:{resize:function(){if(this.$el.offsetParent){var e=this.$el.style.height,t=parseInt(e)||0,n=this.$el.scrollHeight;t&&n<t?(this.$el.style.height=`auto`,this.$el.style.height=`${this.$el.scrollHeight}px`):(!t||n>t)&&(this.$el.style.height=`${n}px`)}},onInput:function(e){this.autoResize&&this.resize(),this.writeValue(e.target.value,e)}},computed:{attrs:function(){return b(this.ptmi(`root`,{context:{filled:this.$filled,disabled:this.disabled}}),this.formField)},dataP:function(){return r(j({invalid:this.$invalid,fluid:this.$fluid,filled:this.$variant===`filled`},this.size,this.size))}}},F=[`value`,`name`,`disabled`,`aria-invalid`,`data-p`];function I(e,t,r,i,a,o){return h(),n(`textarea`,b({class:e.cx(`root`),value:e.d_value,name:e.name,disabled:e.disabled,"aria-invalid":e.invalid||void 0,"data-p":o.dataP,onInput:t[0]||=function(){return o.onInput&&o.onInput.apply(o,arguments)}},o.attrs),null,16,F)}P.render=I;var L={},R={viewBox:`0 0 240 200`,width:`220`,height:`183`,"aria-hidden":`true`};function z(e,t){return h(),n(`svg`,R,[...t[0]||=[f(`<defs><linearGradient id="me-back" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dfe6ff"></stop><stop offset="1" stop-color="#b9c8ff"></stop></linearGradient><linearGradient id="me-front" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfdbff"></stop><stop offset="1" stop-color="#a9bcff"></stop></linearGradient></defs><circle cx="120" cy="92" r="84" fill="#e4e8ff"></circle><g stroke="#4a7dff" stroke-width="4" stroke-linecap="round"><path d="M176 26l8-10M190 40l12-6M60 30l-8-10M46 46l-12-4"></path></g><rect x="52" y="92" width="136" height="86" rx="10" fill="url(#me-back)"></rect><path d="M120 22c-30 0-46 22-46 52v26h92V74c0-30-16-52-46-52z" fill="#141a45"></path><path d="M96 66c8-5 16-5 24 0 8-5 16-5 24 0 2 10-3 19-11 20-6 1-9-4-13-4s-7 5-13 4c-8-1-13-10-11-20z" fill="#fff"></path><ellipse cx="108" cy="72" rx="6" ry="3.5" transform="rotate(14 108 72)" fill="#141a45"></ellipse><ellipse cx="132" cy="72" rx="6" ry="3.5" transform="rotate(-14 132 72)" fill="#141a45"></ellipse><path d="M52 100l68 52 68-52v68a10 10 0 0 1-10 10H62a10 10 0 0 1-10-10z" fill="url(#me-front)"></path><path d="M52 168l54-42M188 168l-54-42" stroke="#e9eeff" stroke-width="2" opacity=".8"></path>`,10)]])}var B=T(L,[[`render`,z]]),V={class:`bar`},H={key:0,class:`center mt-8`},U={key:1,class:`center mt-8`},W={class:`center mt-2`},G={class:`field`},K={class:`counter`},q={class:`send-wave`,"aria-hidden":`true`},J=500,Y=_({__name:`SendView`,setup(r){let a=S(),s=C(),f=d(()=>String(a.params.slug)),p=i(`loading`),_=i(``),b=i(!1);m(async()=>{try{p.value=await x.profileExists(f.value)?`ready`:`invalid`}catch{p.value=`ready`}});async function T(){let e=_.value.trim();if(e&&!b.value){b.value=!0;try{await x.sendMessage(f.value,e),_.value=``,p.value=`sent`}catch{s.add({severity:`error`,summary:`Não foi possível enviar`,detail:`Tente novamente em instantes.`,life:3500})}finally{b.value=!1}}}return(r,i)=>{let a=v(`RouterLink`);return h(),n(u,null,[t(`header`,V,[e(a,{to:`/`,class:`icon-btn`,"aria-label":`Voltar`},{default:l(()=>[...i[2]||=[t(`i`,{class:`pi pi-arrow-left`,"aria-hidden":`true`},null,-1)]]),_:1}),i[3]||=t(`h2`,{class:`bar-title`},`Enviar Mensagem`,-1),i[4]||=t(`span`,{class:`icon-btn icon-btn--static`,"aria-hidden":`true`},[t(`i`,{class:`pi pi-shield`})],-1)]),p.value===`sent`?(h(),n(`section`,H,[e(B),i[6]||=t(`h1`,{class:`title title--sm`},`Mensagem enviada!`,-1),i[7]||=t(`p`,{class:`lead lead--dark`},`Ela chegou em segredo. Ninguém saberá que foi você.`,-1),e(c(y),{class:`btn-blue mt-6`,icon:`pi pi-send`,label:`Enviar outra mensagem`,onClick:i[0]||=e=>p.value=`ready`}),e(a,{to:`/`,class:`text-link`},{default:l(()=>[...i[5]||=[o(`Quero receber mensagens também`,-1)]]),_:1})])):p.value===`invalid`?(h(),n(`section`,U,[e(B),i[9]||=t(`h1`,{class:`title title--sm`},`Link inválido`,-1),i[10]||=t(`p`,{class:`lead lead--dark`},`Não encontramos este perfil. Peça um novo link ao seu amigo.`,-1),e(a,{to:`/`,class:`text-link`},{default:l(()=>[...i[8]||=[o(`Criar o meu link`,-1)]]),_:1})])):(h(),n(u,{key:2},[t(`section`,W,[e(B),i[11]||=t(`h1`,{class:`title title--sm`},[o(` Deixe sua mensagem `),t(`span`,{class:`grad-text-blue`},`(anônima)`)],-1)]),t(`form`,{class:`stack mt-5`,onSubmit:w(T,[`prevent`])},[t(`div`,G,[i[12]||=t(`label`,{for:`msg`,class:`sr-only`},`Sua mensagem`,-1),e(c(P),{id:`msg`,modelValue:_.value,"onUpdate:modelValue":i[1]||=e=>_.value=e,maxlength:J,rows:`6`,placeholder:`Escreva aqui o que deseja dizer...`,disabled:p.value===`loading`},null,8,[`modelValue`,`disabled`]),t(`span`,K,g(_.value.length)+`/`+g(J),1)]),e(c(y),{type:`submit`,class:`btn-blue`,icon:`pi pi-send`,label:`Enviar Mensagem`,loading:b.value,disabled:!_.value.trim()||p.value===`loading`},null,8,[`loading`,`disabled`]),i[13]||=t(`p`,{class:`note`},[t(`i`,{class:`pi pi-lock`,"aria-hidden":`true`}),t(`span`,null,`Sua identidade será totalmente mantida em sigilo.`)],-1)],32)],64)),t(`div`,q,[e(E,{variant:`light`})])],64)}}});export{Y as default};