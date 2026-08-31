import{j as n}from"./jsx-runtime-C5WNSv3b.js";import{c as C}from"./compiler-runtime-UxW7TvPJ.js";import{B as R}from"./button-BQ2LyEX9.js";import{b as z,c as j,d as L,a as M}from"./card-DCtGu-ac.js";import{t as O}from"./index-Dxcz6xcn.js";import"./iframe-BR0eYTGY.js";import"./preload-helper-PPVm8Dsz.js";var l=(e=>(e.SignIn="AUTH.SignIn",e.OAuthRedirect="AUTH.OAuthRedirect",e.PersistState="AUTH.PersistState",e))(l||{}),d=(e=>(e.Success="AUTH.Success",e.Error="AUTH.Error",e))(d||{});const T="1.0.0-beta.1",p=(e,t,r)=>{O(e,t,{ApplicationName:"Widget.ExternalAuth",WidgetVersion:T,...r})},B="uipath-external-auth:oauth:";function A(e){let t="";for(const r of e)t+=String.fromCharCode(r);return btoa(t).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}function P(e=32){const t=new Uint8Array(e);return crypto.getRandomValues(t),A(t)}async function D(e){const t=new TextEncoder().encode(e),r=await crypto.subtle.digest("SHA-256",t);return A(new Uint8Array(r))}function _(e){let t;try{t=new URL(e)}catch{throw new Error(`ExternalAuth: authorizeUrl must be an absolute URL; got "${e}".`)}if(t.protocol!=="https:")throw new Error(`ExternalAuth: authorizeUrl must use https; got "${e}".`);return t}async function H(e,t){const{authorizeUrl:r,redirectUri:m,scopes:u,responseType:x="code",usePkce:o=!0,extraParams:i={}}=t,a=_(r),h=P(),s=new URLSearchParams({...i,client_id:e,redirect_uri:m,response_type:x,scope:u,state:h}),c={state:h};if(o){const g=P(),b=await D(g);s.set("code_challenge",b),s.set("code_challenge_method","S256"),c.codeVerifier=g}try{sessionStorage.setItem(B+e,JSON.stringify(c))}catch{throw p(l.PersistState,d.Error,{Error:"sessionStorage_unavailable"}),new Error("ExternalAuth: could not persist the OAuth state/PKCE verifier to sessionStorage; aborting the sign-in redirect because the callback would not be able to verify this login.")}for(const[g,b]of s)a.searchParams.set(g,b);return a.toString()}function G(e){return t=>{H(t,e).then(r=>{p(l.OAuthRedirect,d.Success,{UsePkce:e.usePkce!==!1,ResponseType:e.responseType??"code"}),window.location.assign(r)}).catch(r=>{p(l.OAuthRedirect,d.Error,{Error:"redirect failed"}),console.error("ExternalAuth: failed to start the sign-in redirect.",r)})}}const W=(e,t)=>e==null||e===""?null:typeof e=="string"?n.jsx("img",{src:e,alt:`${t} icon`,"aria-hidden":"true",className:"h-5 w-5 shrink-0 object-contain"}):n.jsx("span",{"aria-hidden":"true",className:"flex h-5 w-5 shrink-0 items-center justify-center",children:e}),E=e=>{const t=C.c(10),{authProviders:r,title:m}=e,u=m===void 0?"Sign in to your account":m,x=F;let o;t[0]!==u?(o=n.jsx(z,{children:n.jsx(j,{role:"heading","aria-level":1,className:"text-center",children:u})}),t[0]=u,t[1]=o):o=t[1];let i;if(t[2]!==r){let s;t[4]===Symbol.for("react.memo_cache_sentinel")?(s=c=>n.jsxs(R,{type:"button",variant:"outline",className:"h-auto w-full gap-3 px-4 py-3 text-base font-semibold",onClick:()=>x(c),children:[W(c.displayIcon,c.displayName),n.jsxs("span",{children:["Continue with ",c.displayName]})]},c.displayName),t[4]=s):s=t[4],i=r.map(s),t[2]=r,t[3]=i}else i=t[3];let a;t[5]!==i?(a=n.jsx(L,{className:"flex flex-col gap-4",children:i}),t[5]=i,t[6]=a):a=t[6];let h;return t[7]!==o||t[8]!==a?(h=n.jsxs(M,{className:"uipath-external-auth w-[400px]",children:[o,a]}),t[7]=o,t[8]=a,t[9]=h):h=t[9],h};E.__docgenInfo={description:"",methods:[],displayName:"ExternalAuth",props:{authProviders:{required:!0,tsType:{name:"Array",elements:[{name:"AuthProvider"}],raw:"AuthProvider[]"},description:"Providers to render, in order, one button each"},title:{required:!1,tsType:{name:"string"},description:"Heading shown at the top of the widget",defaultValue:{value:'"Sign in to your account"',computed:!1}}}};function F(e){const{onSignIn:t}=e;if(t){p(l.SignIn,d.Success,{Provider:e.displayName,Method:"customHandler"}),Promise.resolve().then(()=>t(e.clientId)).catch(r=>{p(l.SignIn,d.Error,{Provider:e.displayName,Error:"onSignIn failed"}),console.error(`ExternalAuth: the onSignIn handler for provider "${e.displayName}" failed.`,r)});return}if(e.oauth){p(l.SignIn,d.Success,{Provider:e.displayName,Method:"oauthRedirect"}),G(e.oauth)(e.clientId);return}p(l.SignIn,d.Error,{Provider:e.displayName,Error:"no_handler"}),console.warn(`ExternalAuth: provider "${e.displayName}" has neither an onSignIn handler nor an oauth config; its button click does nothing.`)}const U=n.jsxs("svg",{viewBox:"0 0 24 24",width:"20",height:"20","aria-hidden":"true",children:[n.jsx("path",{fill:"#4285F4",d:"M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"}),n.jsx("path",{fill:"#34A853",d:"M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"}),n.jsx("path",{fill:"#FBBC05",d:"M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"}),n.jsx("path",{fill:"#EA4335",d:"M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"})]}),k=n.jsxs("svg",{viewBox:"0 0 24 24",width:"20",height:"20","aria-hidden":"true",fill:"none",stroke:"#4B5563",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[n.jsx("path",{d:"M12 2l8 3.5v5.1c0 5-3.4 9.6-8 11.4-4.6-1.8-8-6.4-8-11.4V5.5L12 2z"}),n.jsx("path",{d:"M9 12l2 2 4-4"})]}),N=n.jsxs("svg",{viewBox:"0 0 24 24",width:"20",height:"20","aria-hidden":"true",children:[n.jsx("rect",{x:"2",y:"2",width:"20",height:"20",rx:"4",fill:"#0B2A1E"}),n.jsx("path",{d:"M12 6.5a4 4 0 0 1 4 4c0 2.6-1.3 5-4 7-2.7-2-4-4.4-4-7a4 4 0 0 1 4-4z",fill:"none",stroke:"#C8A24B",strokeWidth:"1.6"}),n.jsx("circle",{cx:"12",cy:"10.5",r:"1.4",fill:"#C8A24B"})]}),w=[{displayName:"Google",displayIcon:U,clientId:"google-client-id",onSignIn:e=>console.log("Sign in with",e)},{displayName:"SAML",displayIcon:k,clientId:"saml-connection-id",onSignIn:e=>console.log("Sign in with",e)},{displayName:"UAE PASS",displayIcon:N,clientId:"uaepass-client-id",onSignIn:e=>console.log("Sign in with",e)}],Y={title:"Components/ExternalAuth",component:E,parameters:{layout:"centered",docs:{description:{component:`
A provider-agnostic React sign-in widget. It renders one button per configured authentication provider and starts the login **directly at that provider's IdP** — there is no UiPath broker in between. Each provider either supplies its own \`onSignIn\` handler (which always wins) or, for OIDC providers (Google, UAE PASS, …), an \`oauth\` config that enables the widget's built-in authorization-code redirect. Everything after the redirect — callback validation, token exchange, session creation — is the consumer's responsibility.

## Features

- Renders any number of authentication providers
- Fully provider-agnostic: name, icon, client ID, and sign-in handler are supplied per provider
- Built-in default sign-in for any OIDC provider (direct authorize redirect with CSRF \`state\` and PKCE)
- Per-provider \`onSignIn\` override that always wins — required for SAML 2.0, which must be started by the app's backend Service Provider
- Icons can be inline SVG/React elements or image URLs
- Customizable heading

## Installation

\`\`\`bash
npm install @uipath/ui-widgets-external-auth
\`\`\`

## Usage

> **Note:** Add either \`light\` or \`dark\` class to your HTML \`<body>\` element to enable proper theming.

\`\`\`tsx
import { ExternalAuth } from '@uipath/ui-widgets-external-auth';
import "@uipath/ui-widgets-external-auth/ExternalAuth.css";

function App() {
  return (
    <ExternalAuth
      authProviders={[
        {
          displayName: "Google",
          displayIcon: <GoogleIcon />,
          clientId: "your-google-client-id",
          // No onSignIn — the built-in default redirects straight to Google:
          oauth: {
            authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
            redirectUri: "https://myapp.com/auth/google/callback",
            scopes: "openid email profile",
          },
        },
        {
          displayName: "SAML",
          displayIcon: "https://example.com/shield.svg",
          clientId: "saml-connection-id",
          // SAML must be started by your backend Service Provider:
          onSignIn: (clientId) =>
            window.location.assign(\`/auth/saml/login?connection=\${clientId}\`),
        },
      ]}
    />
  );
}
\`\`\`

## Requirements

- React 19.2.0+
- React DOM 19.2.0+`}}},tags:["autodocs"],argTypes:{authProviders:{description:"Array of authentication providers. Each entry supplies a displayName, an optional displayIcon (React node or image URL), a clientId, and either an onSignIn callback (always wins) or an oauth config enabling the built-in direct OIDC redirect.",control:!1},title:{description:"Heading shown at the top of the widget",control:"text"}}},y={args:{authProviders:w}},f={args:{authProviders:w,title:"Welcome back"},parameters:{docs:{description:{story:"Overrides the default heading via the `title` prop."}}}},S={args:{authProviders:[w[0]]},parameters:{docs:{description:{story:"Works with a single provider."}}}},v={args:{authProviders:w.map(({displayName:e,clientId:t,onSignIn:r})=>({displayName:e,clientId:t,onSignIn:r}))},parameters:{docs:{description:{story:"Provider icons are optional — buttons render with the label only."}}}},I={args:{authProviders:[{displayName:"Google",displayIcon:U,clientId:"google-client-id",oauth:{authorizeUrl:"https://idp.example.com/google/authorize",redirectUri:"https://myapp.example.com/auth/google/callback",scopes:"openid email profile"}},{displayName:"UAE PASS",displayIcon:N,clientId:"uaepass-client-id",oauth:{authorizeUrl:"https://idp.example.com/uaepass/authorize",redirectUri:"https://myapp.example.com/auth/uaepass/callback",scopes:"urn:uae:digitalid:profile:general",extraParams:{acr_values:"urn:safelayer:tws:policies:authentication:adaptive"}}},{displayName:"SAML",displayIcon:k,clientId:"saml-connection-id",onSignIn:()=>window.location.assign("/auth/saml/login")}]},parameters:{docs:{description:{story:"The direct-to-IdP architecture: each button takes the user straight to that provider's IdP. OIDC providers (Google, UAE PASS, or any other) opt into the **built-in default sign-in** by carrying an `oauth` config — the widget builds the authorization-code redirect with CSRF `state` and PKCE and navigates to the provider. **SAML must supply an `onSignIn`** that starts the flow at the app's backend Service Provider. A per-provider `onSignIn` always wins over the `oauth` default. The endpoints here are reserved example.com demo values so clicking a button in this docs site doesn't land on a real IdP — swap in the real authorize URLs shown in the code comments."}}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    authProviders: sampleProviders
  }
}`,...y.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    authProviders: sampleProviders,
    title: "Welcome back"
  },
  parameters: {
    docs: {
      description: {
        story: "Overrides the default heading via the \`title\` prop."
      }
    }
  }
}`,...f.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    authProviders: [sampleProviders[0]]
  },
  parameters: {
    docs: {
      description: {
        story: "Works with a single provider."
      }
    }
  }
}`,...S.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    authProviders: sampleProviders.map(({
      displayName,
      clientId,
      onSignIn
    }) => ({
      displayName,
      clientId,
      onSignIn
    }))
  },
  parameters: {
    docs: {
      description: {
        story: "Provider icons are optional — buttons render with the label only."
      }
    }
  }
}`,...v.parameters?.docs?.source}}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    authProviders: [{
      displayName: "Google",
      displayIcon: GoogleIcon,
      clientId: "google-client-id",
      // No onSignIn — the widget redirects straight to the provider's IdP.
      // Demo endpoints only; a real integration uses
      // https://accounts.google.com/o/oauth2/v2/auth
      oauth: {
        authorizeUrl: "https://idp.example.com/google/authorize",
        redirectUri: "https://myapp.example.com/auth/google/callback",
        scopes: "openid email profile"
      }
    }, {
      displayName: "UAE PASS",
      displayIcon: UaePassIcon,
      clientId: "uaepass-client-id",
      // UAE PASS is OIDC too — only the endpoints/scopes/params differ.
      // Demo endpoints only; a real integration uses
      // https://id.uaepass.ae/idshub/authorize
      oauth: {
        authorizeUrl: "https://idp.example.com/uaepass/authorize",
        redirectUri: "https://myapp.example.com/auth/uaepass/callback",
        scopes: "urn:uae:digitalid:profile:general",
        extraParams: {
          acr_values: "urn:safelayer:tws:policies:authentication:adaptive"
        }
      }
    }, {
      displayName: "SAML",
      displayIcon: SamlIcon,
      clientId: "saml-connection-id",
      // SAML cannot be started from the browser — the AuthnRequest must come
      // from the app's backend Service Provider, so onSignIn points there.
      onSignIn: () => window.location.assign("/auth/saml/login")
    }]
  },
  parameters: {
    docs: {
      description: {
        story: "The direct-to-IdP architecture: each button takes the user straight " + "to that provider's IdP. OIDC providers (Google, UAE PASS, or any " + "other) opt into the **built-in default sign-in** by carrying an " + "\`oauth\` config — the widget builds the authorization-code redirect " + "with CSRF \`state\` and PKCE and navigates to the provider. **SAML " + "must supply an \`onSignIn\`** that starts the flow at the app's " + "backend Service Provider. A per-provider \`onSignIn\` always wins " + "over the \`oauth\` default. The endpoints here are reserved " + "example.com demo values so clicking a button in this docs site " + "doesn't land on a real IdP — swap in the real authorize URLs shown " + "in the code comments."
      }
    }
  }
}`,...I.parameters?.docs?.source}}};const Z=["Default","CustomTitle","SingleProvider","WithoutIcons","BuiltInOidcDefault"];export{I as BuiltInOidcDefault,f as CustomTitle,y as Default,S as SingleProvider,v as WithoutIcons,Z as __namedExportsOrder,Y as default};
