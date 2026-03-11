import { useId } from 'react';

export default function DateTabs({ dates, selectedDate, onSelectDate }) {
    const groupId = useId();

    if (!dates || dates.length === 0) return null;

    return (
        <div className="flex justify-center mb-8 w-full overflow-x-auto">
            <div role="tablist" className="tabs tabs-box inline-flex whitespace-nowrap">
                {dates.map(date => (
                    <input
                        key={date}
                        type="radio"
                        name={`date_tabs_${groupId}`}
                        role="tab"
                        className="tab"
                        aria-label={date}
                        checked={selectedDate === date}
                        onChange={() => onSelectDate(date)}
                    />
                ))}
            </div>
        </div>
    );
}
