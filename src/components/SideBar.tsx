import {FaHome, FaInfo, FaServicestack} from 'react-icons/fa';
import {Link} from "react-router-dom";

const Sidebar = () => {
    return (
        <div className="w-64 h-screen border-r-2 text-white">
            <div className="p-4 text-lg font-bold text-center">Kate</div>
            <ul>
                <Link to="/">
                    <li className="p-4 hover:bg-gray-700 cursor-pointer flex items-center">
                        <FaHome className="mr-2"/> Conversation

                    </li>
                </Link>
                <Link to="/task">
                    <li className="p-4 hover:bg-gray-700 cursor-pointer flex items-center">
                        <FaInfo className="mr-2"/> Tasks
                    </li>
                </Link>
                <Link to="/assistant">
                    <li className="p-4 hover:bg-gray-700 cursor-pointer flex items-center">
                        <FaServicestack className="mr-2"/> Assistant
                    </li>
                </Link>
                <Link to="/models">
                    <li className="p-4 hover:bg-gray-700 cursor-pointer flex items-center">
                        <FaServicestack className="mr-2"/> Models
                    </li>
                </Link>
            </ul>
        </div>
    );
}

export default Sidebar;
