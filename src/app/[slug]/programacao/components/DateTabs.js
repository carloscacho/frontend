export default function DateTabs({ dates, selectedDate, onSelectDate }) {
    if (!dates || dates.length === 0) return null;

    return (
        <div className="flex justify-center mb-8 space-x-2 overflow-x-auto">
            {dates.map(date => (
                <button
                    key={date}
                    onClick={() => onSelectDate(date)}
                    className={`btn ${selectedDate === date ? 'btn-primary' : 'btn-outline btn-primary'} rounded-none`}
                >
                    {date}
                </button>
            ))}
        </div>
    );
}
