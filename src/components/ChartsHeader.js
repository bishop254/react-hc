import TopCardsView from "./TopCardsView";

export default function ChartsHeader() {

  return (
    <>
      <div className="p-component p-fluid">
        <div className="p-4">
          <header className="mb-4">
            <div className="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-1">
              <div>
                <h1 className="text-2xl font-bold flex justify-content-start mb-1">
                  Supply Chain Analytics
                </h1>
                <p className="text-color-secondary m-0">
                  Key performance indicators and metrics for supply chain
                  management
                </p>
              </div>
              <div className="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-1"></div>
            </div>
          </header>
        </div>
      </div>

      <TopCardsView />
    </>
  );
}
