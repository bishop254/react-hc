import React from "react";

import CalibrationLineChart from "./TopCardsCharts/CalibrationLineChart";
import MSIScoreLineChart from "./TopCardsCharts/MSIScoreLineChart";
import SupplierSpendLineChart from "./TopCardsCharts/SupplierSpendLineChart";
import OpenNonComplianceLineChart from "./TopCardsCharts/OpenNonComplianceLineChart";
const TopCardsView = () => {
  return (
    <div className="flex flex-wrap lg:flex-nowrap justify-content-center gap-2 mt-4">
      <CalibrationLineChart />
      <MSIScoreLineChart />
      <SupplierSpendLineChart />
      <OpenNonComplianceLineChart />
    </div>
  );
};

export default TopCardsView;
