import { useState } from "react"

function FlowList() {
    const [currentName, setCurrentName] = useState<string>('这是工作流列表页')
    return <>
        <div>{currentName}</div>
    </>
}

export default FlowList
