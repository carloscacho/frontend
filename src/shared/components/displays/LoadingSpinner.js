export default function LoadingSpinner({ fullScreen = false, message = null, size = "lg" }) {
    if (fullScreen) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-base-200">
                <span className={`loading loading-spinner loading-${size} text-primary`}></span>
                {message && <p className="mt-4 text-lg">{message}</p>}
            </div>
        );
    }

    return (
        <div className="flex flex-col justify-center items-center py-6">
            <span className={`loading loading-spinner loading-${size} text-primary`}></span>
            {message && <p className="mt-2 text-md">{message}</p>}
        </div>
    );
}
