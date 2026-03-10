//SearchBar file


export default function SearchBar({search, setSearch}){ // It receives two props: Search and setSearch
    return(
        <div className="flex mb-6">
            <input 
            type ="text"
            value={search}// This means:React controls input value. Whenever search changes,input updates.
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your ideas..."
            className="flex-1 p-3 border rounded-l-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"/>

            <button className="bg-indigo-600 text-white px-6 rounded-r-xl">Search</button>{/* //px-6 → horizontal padding */}
            
        </div>

    );
}