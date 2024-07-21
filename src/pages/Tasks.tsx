import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { FaEdit, FaTrash } from "react-icons/fa";

interface AppInfo {
    name: string;
    command: string;
}

export const Tasks = () => {
    const [apps, setApps] = useState<AppInfo[]>([]);
    const [newAppCommand, setNewAppCommand] = useState<string>("");
    const [newAppName, setNewAppName] = useState<string>("");
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [currentIndex, setCurrentIndex] = useState<number | null>(null);

    useEffect(() => {
        const savedApps = localStorage.getItem("apps");
        if (savedApps) {
            setApps(JSON.parse(savedApps));
        }
    }, []);

    useEffect(() => {
        if (apps.length > 0) {
            localStorage.setItem("apps", JSON.stringify(apps));
        }
    }, [apps]);

    const handleAddApp = () => {
        if (newAppCommand && newAppName) {
            if (isEditing && currentIndex !== null) {
                const updatedApps = [...apps];
                updatedApps[currentIndex] = { name: newAppName, command: newAppCommand };
                setApps(updatedApps);
                setIsEditing(false);
                setCurrentIndex(null);
            } else {
                const newApp: AppInfo = { name: newAppName, command: newAppCommand };
                setApps([...apps, newApp]);
            }
            setNewAppCommand("");
            setNewAppName("");
        } else {
            alert("Please enter both a command and a name.");
        }
    };

    const handleOpenApp = async (command: string) => {
        try {
            await invoke('open_app', { name: command });
            alert('App opened successfully!');
        } catch (error) {
            alert('Failed to open app: ' + error);
        }
    };

    const handleEditApp = (index: number) => {
        setCurrentIndex(index);
        setNewAppName(apps[index].name);
        setNewAppCommand(apps[index].command);
        setIsEditing(true);
    };

    const handleDeleteApp = (index: number) => {
        const updatedApps = apps.filter((_, i) => i !== index);
        setApps(updatedApps);
    };

    return (
        <div className="mx-auto p-4">
            <h3 className="text-2xl font-black mb-4">Application Launcher</h3>
            <div className="mb-4">
                {apps.map((app, index) => (
                    <div key={index} className="flex items-center justify-between mb-2">
                        <Button
                            className="text-white px-4 py-2 w-full mr-5 rounded bg-blue-950 hover:bg-blue-900"
                            onClick={() => handleOpenApp(app.command)}
                        >
                            {app.name}
                        </Button>
                        <div className="flex space-x-2">
                            <Button
                                className="text-white px-4 py-2 rounded bg-yellow-700 hover:bg-yellow-900"
                                onClick={() => handleEditApp(index)}
                            >
                                <FaEdit />
                            </Button>
                            <Button
                                className="text-white px-4 py-2 rounded bg-red-700 hover:bg-red-900"
                                onClick={() => handleDeleteApp(index)}
                            >
                                <FaTrash />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
            <Sheet>
                <SheetTrigger asChild>
                    <Button className="flex items-center space-x-2 text-white px-4 py-2 rounded bg-gray-900 hover:bg-gray-700 w-full">
                        <span>{isEditing ? "Edit Application" : "Add Application"}</span>
                    </Button>
                </SheetTrigger>
                <SheetContent className="w-[400px] sm:w-[540px] overflow-auto">
                    <SheetHeader>
                        <SheetTitle>{isEditing ? "Edit Application" : "Add New Application"}</SheetTitle>
                        <SheetDescription>
                            <div className="new-app">
                                <Input
                                    type="text"
                                    placeholder="Enter terminal command"
                                    className="border border-gray-300 p-2 rounded mb-2 w-full"
                                    value={newAppCommand}
                                    onChange={(e) => setNewAppCommand(e.target.value)}
                                />
                                <Input
                                    type="text"
                                    placeholder="Enter name for the application"
                                    className="border border-gray-300 p-2 rounded mb-2 w-full"
                                    value={newAppName}
                                    onChange={(e) => setNewAppName(e.target.value)}
                                />
                                <Button
                                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                    onClick={handleAddApp}
                                >
                                    {isEditing ? "Update Application" : "Add Application"}
                                </Button>
                            </div>
                        </SheetDescription>
                    </SheetHeader>
                </SheetContent>
            </Sheet>
        </div>
    );
};
