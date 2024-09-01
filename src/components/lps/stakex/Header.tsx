export const Header = () => {
    return (
        <div className="flex flex-col p-8 md:py-8 md:px-0">
            <h1 className="flex w-full max-w-2xl flex-row font-title text-3xl font-bold tracking-wide">
                <span className="text-techGreen">STAKE</span>
                <span className="text-degenOrange">X</span>
            </h1>
            <span>
                created by{' '}
                <span className="font-title font-bold">
                    <span className=" text-techGreen">DEGEN</span>
                    <span className="text-degenOrange">X</span> Ecosystem
                </span>
            </span>
        </div>
    )
}
