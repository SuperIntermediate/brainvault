//Grid Container
import NoteCard from "./NoteCard";

export default function NotesGrid({notes}){//Receives notes as a prop.
    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map(note => (
                <NoteCard key={note._id} note={note}/>
            ))}
        </div>
    )
}
//Responsive Columns

// md:grid-cols-2 → On medium screens → 2 columns

// lg:grid-cols-3 → On large screens → 3 columns

// On small screens → default = 1 column