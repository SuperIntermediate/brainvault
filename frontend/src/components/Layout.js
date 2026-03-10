// This is app skeleton. Not logic. Not API.
//Component Declaration
export default function Layout({children}){
    return(
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <div className="w-64 bg-white shadow-md p-6 hidden md:block"> {/* //hidden md:block → Hidden on small screens, visible on medium+ */}
                {/* App Title */}
                <h2 className="text-xl font-bold text-indigo-600 mb-6">BrainVault</h2>

                {/* Navigation Menu */}
                <ul className="space-y-4 text-gray-700">
                    <li className="hover:text-indigo-600 cursor-pointer">All Notes</li>
                    <li className="hover:text-indigo-600 cursor-pointer">Ideas</li>
                    <li className="hover:text-indigo-600 cursor-pointer">Links</li>
                </ul>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8">
                {children}
            </div>
        </div>
    )    
}