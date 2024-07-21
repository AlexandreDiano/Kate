import {useEffect, useState} from "react";
import {invoke} from "@tauri-apps/api/tauri";
import {FaRegTrashAlt} from "react-icons/fa";
import {HiOutlinePlusSm} from "react-icons/hi";
import {Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger} from "@/components/ui/sheet.tsx";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {Button} from "@/components/ui/button.tsx";

interface ModelType {
    name: string;
    model: string;
    details: {
        format: string;
        families: string[];
        parameter_size: string;
    };
}

interface ApiResponse {
    success: boolean;
    data: string | null;
    error: string | null;
}

interface ContentType {
    id: number;
    name: string;
    description: string;
    sizes: string[];
}

interface DetailsType { more: boolean, item: number | null }

export const Models = () => {
    const [modelList, setModelList] = useState<ModelType[]>([]);
    const [content, setContent] = useState<ContentType[]>([]);
    const [details, setDetails] = useState<DetailsType>({ more: false, item: null });
    const [loading, setLoading] = useState(false);  // Estado para o loader
    const [loadingDelete, setLoadingDelete] = useState<string | null>(null);
    const [loadingNew, setLoadingNew] = useState<string | null>(null);

    const fetchModels = async () => {
        try {
            setLoading(true);
            const response = await invoke<string>('index_models');
            const parsedResponse: ApiResponse = JSON.parse(response);

            if (parsedResponse.success && parsedResponse.data) {
                const models = JSON.parse(parsedResponse.data).models as ModelType[];
                setModelList(models);
            } else {
                console.error("Failed to fetch models:", parsedResponse.error);
            }
        } catch (error) {
            console.error("Failed to fetch models:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchModels();
    }, []);


    const handleDeleteModel = async (name: string) => {
        try {
            setLoadingDelete(name);
            await invoke('delete_model', { name });
            fetchModels();
        } catch (error) {
            console.error("Failed to delete model:", error);
        } finally {
            setLoadingDelete(null);
        }
    };

    const handleChooseNewModel = async () => {
        try {
            setLoading(true);
            const response: ApiResponse = await invoke('fetch_ul_content', { url: "https://ollama.com/library" });

            if (response.success && response.data) {
                const extractedContent = extractImportantValues(response.data);
                // @ts-ignore
                setContent(extractedContent);
            } else {
                console.error("Error in response:", response.error);
            }
        } catch (error) {
            console.error("Failed to fetch list elements:", error);
        } finally {
            setLoading(false);
        }
    };

    const extractImportantValues = (htmlString: string) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');
        const listItems = doc.querySelectorAll('li');

        return Array.from(listItems).map((li, index) => {
            const name = li.querySelector('h2 span')?.textContent?.trim() || '';
            const description = li.querySelector('p')?.textContent?.trim() || '';
            const sizes = Array.from(li.querySelectorAll('div.flex-wrap span')).map((span) => span.textContent?.trim());

            return {
                id: index,
                name,
                description,
                sizes,
            };
        });
    };

    const handleSeeMore = (item_value: number) => {
        setDetails({ more: !details.more, item: item_value });
    }

    const handleNewModel = async (name: string) => {
        try {
            setLoadingNew(name);
            await invoke('new_model', { name });
            fetchModels();
        } catch (error) {
            console.error("Failed to add new model:", error);
        } finally {
            setLoadingNew(null);
        }
    };


    const formatName = (name: string) => {
        let formattedName = name.replace(':latest', '');
        formattedName = formattedName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        return formattedName;
    };

    return (
        <div className="flex flex-col items-center p-3 w-full">
            <h2 className="text-2xl font-black py-3">Model List</h2>

            <Sheet>
                <SheetTrigger asChild>
                    <Button onClick={handleChooseNewModel}
                            className="flex items-center space-x-2 text-white px-4 py-2 rounded w-[400px] bg-gray-900 hover:bg-gray-700">
                        <HiOutlinePlusSm className="w-6 h-6"/>
                        <span>Add Model</span>
                    </Button>

                </SheetTrigger>
                <SheetContent className="w-[400px] sm:w-[540px] overflow-auto">
                    <SheetHeader>
                        <SheetTitle>Models</SheetTitle>
                        <SheetDescription>
                            {loading ? (
                                <div className="flex flex-col space-y-3 p-5">
                                    <div className="py-5">
                                        <Skeleton className="h-[125px] w-[320px] rounded-xl"/>
                                        <div className="space-y-2 py-2">
                                            <Skeleton className="h-4 w-[300px]"/>
                                            <Skeleton className="h-4 w-[250px]"/>
                                        </div>
                                    </div>
                                    <div className="py-5">
                                        <Skeleton className="h-[125px] w-[320px] rounded-xl"/>
                                        <div className="space-y-2 py-2">
                                            <Skeleton className="h-4 w-[300px]"/>
                                            <Skeleton className="h-4 w-[250px]"/>
                                        </div>
                                    </div>
                                    <div className="py-5">
                                        <Skeleton className="h-[125px] w-[320px] rounded-xl"/>
                                        <div className="space-y-2 py-2">
                                            <Skeleton className="h-4 w-[300px]"/>
                                            <Skeleton className="h-4 w-[250px]"/>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <ul className="grid grid-cols-1 gap-y-3" role="list">
                                    {content.map((item, index) => (
                                        <li key={index}
                                            className="flex items-baseline border-b border-neutral-200 py-6">
                                            <a className="group w-full cursor-pointer"
                                               onClick={() => handleNewModel(item.name)}>
                                                <div className="flex items-center mb-3">
                                                    <h2 className="truncate text-lg font-medium underline-offset-2 group-hover:underline md:text-2xl">{item.name}</h2>
                                                </div>
                                                <div className="flex flex-col space-y-2">
                                                    <p className="max-w-md break-words">{item.description}</p>
                                                    <div className="flex flex-wrap space-x-2">
                                                        {item.sizes.map((size, idx) => (
                                                            <span key={idx}
                                                                  className="inline-flex items-center rounded-md bg-[#ddf4ff] px-2 py-[2px] text-xs sm:text-[13px] font-medium text-blue-600">{size}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </SheetDescription>
                    </SheetHeader>
                </SheetContent>
            </Sheet>

            <div className="w-1/3">
                {modelList.length > 0 ? (
                    modelList.map((model, index) => (
                        <div key={index} className="my-5 bg-gray-900 text-center p-5 rounded-lg">
                            <div className="flex justify-end">
                                <FaRegTrashAlt className="cursor-pointer"
                                               onClick={() => handleDeleteModel(model.name)}/>
                                {loadingDelete === model.name &&
                                    <div><Skeleton className="h-4 w-[525px] py-3 my-3 flex justify-center items-center"
                                                   children="Deleting..."/></div>}
                            </div>

                            <h3 className="font-black text-xl">{formatName(model.name)}</h3>
                            <h4 className="font-bold text-md">Model: {model.model}</h4>
                            <a className="cursor-pointer"
                               onClick={() => handleSeeMore(index)}>{details.more && details.item === index ? "See Less" : "See More"}</a>
                            <div className={`${details.more && details.item === index ? 'block' : 'hidden'}`}>
                                <p className="font-light">Format: {model.details.format}</p>
                                <p className="font-light">Families: {model.details.families.join(', ')}</p>
                                <p className="font-light">Parameter Size: {model.details.parameter_size}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>Loading models...</p>
                )}
            </div>

            <div>
                {loadingNew && (
                    <div>
                        <Skeleton className="h-[125px] w-[550px] rounded-xl flex justify-center items-center"
                                  children={`Adding new model: ${loadingNew}...`}/>
                        <div className="space-y-2 py-2">
                            <Skeleton className="h-4 w-[525px]"/>
                            <Skeleton className="h-4 w-[500px]"/>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
};
