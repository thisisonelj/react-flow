import { useState } from "react"
import { aiApi } from "../api";
function AiLangChain() {
    const [currentName, setCurrentName] = useState<string>('ai-langchain')
    const aiModelList = aiApi.getModelList({ id: 'liu-ai', page: 1, pageSize: 10 })
    const aiAgent = aiApi.getBasicAgent({ message: '北京' })
    return <>
        <div>{currentName}</div>
    </>
}

export default AiLangChain
