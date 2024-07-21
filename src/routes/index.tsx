import { Route, Routes as Switch } from 'react-router-dom';
import {Dashboard} from "@/layout/dashboard.tsx";
import ChatBox from "@/components/ChatBox.tsx";
import {Models} from "@/pages/Models.tsx";
import {Tasks} from "@/pages/Tasks.tsx";

export const Routes = () => {
    return(
        <Switch>
            <Route path="/" element={<Dashboard />}>
                <Route path="" element={<ChatBox />} />
                <Route path="task" element={<Tasks />} />
                <Route path="assistant" element={<div>Assistant</div>} />
                <Route path="models" element={<Models />} />
            </Route>
        </Switch>
    )
}