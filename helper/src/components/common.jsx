import React, {useState} from 'react';
import {CommandBarButton} from '@fluentui/react'
import { appInsights } from '../index.jsx'

export function arrayAdd(array, key) {
    return array.includes(key) ? array : array.concat(key)
}
export function arrayDel(array, key) {
    const idx = array.indexOf(key)
    return idx >= 0 ? [...array.slice(0, idx), ...array.slice(idx + 1)] : array
}

export function hasError(array, field) {
    return array.findIndex(e => e.field === field) >= 0
}

export function getError(array, field) {
    const idx = array.findIndex(e => e.field === field)
    return idx >= 0 ? array[idx].message : ''
}

export const adv_stackstyle = { root: { border: "1px solid", margin: "10px 0", padding: "15px" } }

export async function saveToProject(filename, content) {
    try {
        const res = await fetch('/api/save-script', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename, content })
        });
        if (!res.ok) return { success: false };
        return await res.json();
    } catch {
        return { success: false };
    }
}


export function CodeBlock({deploycmd, testId, lang, filename, error, hideSave}) {
    const [ copied, setCopied ] = useState(false)
    const [ saveStatus, setSaveStatus ] = useState(null)

    function copyIt() {
        //console.log("AI:- Button.Copy." + testId)
        appInsights.trackEvent({name: "Button.Copy."+ testId});
        navigator.clipboard.writeText(deploycmd)
        setCopied(true)
        setTimeout(() => setCopied(false), 1000)
    }

    async function downloadIt(){
        //console.log("AI:- Button.Save." + testId)
        appInsights.trackEvent({name: "Button.Save."+ testId});
        const name = filename || 'script.sh';
        const result = await saveToProject(name, deploycmd);
        if (result.success) {
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus(null), 2000);
            return;
        }
        // Fallback to blob download
        const blob = new Blob([deploycmd], { type: 'text/x-shellscript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    const onCopyDeployHandler = () => {
        appInsights.trackEvent({name: "Copy."+ testId});
      };

    return [
        <div key="code-header" className="codeHeader" style={{...(error && {borderColor: 'darkred'})}}>
            <span className="language">{lang}</span>
            { error && <div  className="error">{error}</div> }
            { !hideSave &&
            <CommandBarButton
              disabled={error}
              className="action position-relative"
              iconProps={{ iconName: saveStatus === 'saved' ? 'Completed' : 'Save'}}
              //styles={{icon: {color: '#171717'}}}
              text={!error ? (saveStatus === 'saved' ? 'Saved to scripts/' : 'Save') : ""}
              primaryActionButtonProps={{download: filename}}
              onClick={downloadIt}/>
            }
            <CommandBarButton
                    disabled={copied || error}
                    className="action position-relative"
                    iconProps={{ iconName: copied? 'Completed' : 'Copy'}}
                    styles={{icon: {color: '#171717'}}}
                    text={!error ? "Copy" : ""}
                    onClick={copyIt}/>
        </div>,

        <pre key="code-pre" className="has-inner-focus"  style={{...(error && {borderColor: 'darkred'})}}>
            <code onCopyCapture={onCopyDeployHandler} className={"lang-" + lang}><span data-lang={lang} data-testid={testId || 'none'} style={{...(error && {color: 'grey'})}}>{deploycmd}</span></code>
        </pre>
    ]
}

