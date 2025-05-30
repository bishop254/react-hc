import { useState, useRef } from "react";
import { Card } from "primereact/card";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import supplierAssessmentData from "../../data/supplierAssignment_Audit_Actions.json";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";

const OpenNonComplianceLineChart = () => {
  const [selectedData, setSelectedData] = useState(supplierAssessmentData);
  const [clickedMonth, setClickedMonth] = useState(null);
  const [filteredAudits, setFilteredAudits] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const dt = useRef(null);

  const groupByMonth = (data, year = new Date().getFullYear()) => {
    const counts = {};

    for (let m = 1; m <= 12; m++) {
      const monthKey = `${year}-${String(m).padStart(2, "0")}`;
      const label = new Date(year, parseInt(m - 1)).toLocaleString("default", {
        month: "short",
        year: "2-digit",
      });

      counts[monthKey] = {
        value: 0,
        label: label,
      };
    }

    data.forEach((item) => {
      const dateStr = item["modified_on"];
      if (dateStr) {
        const date = new Date(dateStr);
        const keyYear = date.getFullYear();
        const keyMonth = date.getMonth() + 1;
        const key = `${keyYear}-${String(keyMonth).padStart(2, "0")}`;

        if (keyYear === year) {
          counts[key]["value"] += 1;
        }
      }
    });

    return counts;
  };

  const calculateTrend = (monthlyDataObj) => {
    const currentDate = new Date();
    const currentMonthKey = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}`;

    const trendArray = Object.entries(monthlyDataObj)
      .filter(([key]) => key <= currentMonthKey)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([_, data]) => data);

    let last = null;
    let prev = null;

    for (let i = trendArray.length - 1; i >= 0; i--) {
      const val = trendArray[i]?.value;
      if (last === null && val !== null && val !== undefined) {
        last = val;
      } else if (prev === null && val !== null && val !== undefined) {
        prev = val;
        break;
      }
    }

    if (prev === null || prev === 0) return 0;

    const trendPercent = ((last - prev) / prev) * 100;
    return trendPercent.toFixed(1);
  };

  let nonComplianceSuppliers = selectedData.filter(
    (item) =>
      item.supplierActions &&
      item.supplierActions?.some((action) => action.categoryOfFinding === 3)
  );

  console.group();
  console.log(nonComplianceSuppliers);
  console.groupEnd();

  let monthsGrouping = groupByMonth(nonComplianceSuppliers);
  let trend = calculateTrend(monthsGrouping);
  let lineSeries = Object.keys(monthsGrouping).map((item) => {
    return {
      name: monthsGrouping[item]["label"],
      y: monthsGrouping[item]["value"],
    };
  });

  const item = {
    title: "Total No. of open Regulatory Non-compliances",
    value: `${
      (nonComplianceSuppliers.length / selectedData.length).toFixed(1) * 100
    }%`,
    trend: trend,
    trendPositive: trend > 0,
  };

  const chartOptions = {
    chart: { type: "line", height: 100 },
    title: { text: undefined },
    xAxis: { visible: false },
    yAxis: { visible: false },
    legend: { enabled: false },
    credits: { enabled: false },
    tooltip: {
      pointFormat: "<b>{point.y}</b>",
    },
    series: [
      {
        data: lineSeries,
        color: trend > 0 ? "#22C55E" : "#EF4444",
      },
    ],
    plotOptions: {
      series: {
        point: {
          events: {
            click: function () {
              const clickedLabel = this.name;
              const filtered = nonComplianceSuppliers.filter((item) => {
                const date = new Date(item.modified_on);
                const label = date.toLocaleString("default", {
                  month: "short",
                  year: "2-digit",
                });
                return label === clickedLabel;
              });

              setClickedMonth(clickedLabel);
              setFilteredAudits(filtered);
              setShowDialog(true);
            },
          },
        },
      },
    },
  };

  return (
    <Card className="w-full h-full shadow-1 flex flex-column justify-content-between p-3">
      <div>
        <div className="mb-2 text-sm text-color-secondary">{item.title}</div>
        <div className="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-1">
          <div className="text-2xl font-bold text-900">{item.value}</div>
          <div
            className={`text-sm ${
              item.trendPositive ? "text-green-500" : "text-red-500"
            } flex align-items-center gap-2`}
          >
            <i
              className={`pi ${
                item.trendPositive ? "pi-arrow-up" : "pi-arrow-down"
              }`}
            />
            {Math.abs(+item.trend)}%
          </div>
        </div>
      </div>
      <div>
        <HighchartsReact highcharts={Highcharts} options={chartOptions} />
      </div>

      <Dialog
        header={`MSI Score for ${clickedMonth}`}
        visible={showDialog}
        style={{ width: "80vw" }}
        onHide={() => setShowDialog(false)}
        modal
      >
        <div className="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-1 mb-2">
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <input
              type="search"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Global Search"
              className="p-inputtext p-component"
            />
          </span>

          <Button
            label="Export"
            icon="pi pi-download"
            onClick={() =>
              dt.current.exportCSV({
                selectionOnly: false,
                exportFilename: "MSI_Score_Report_" + clickedMonth,
              })
            }
            className="p-button-primary"
          />
        </div>

        <DataTable
          ref={dt}
          value={filteredAudits}
          paginator
          rows={10}
          emptyMessage="No audits found for this month."
          globalFilter={globalFilter}
          globalFilterFields={[
            "vendor.supplierName",
            "vendor.supplierSPOC",
            "vendor.supplierLocation",
            "vendor.supplierContact",
            "auditorAssignmentSubmission.auditorMSIScore",
            "modified_on",
          ]}
          className="p-datatable-sm"
        >
          <Column
            field="id"
            header="Vendor"
            style={{ width: "25%" }}
            body={(rowData) => rowData.vendor?.supplierName || "-"}
          />
          <Column
            header="SPOC"
            style={{ width: "25%" }}
            body={(rowData) => rowData.vendor?.supplierSPOC || "-"}
          />
          <Column
            header="Location"
            style={{ width: "25%" }}
            body={(rowData) => rowData.vendor?.supplierLocation || "-"}
          />
          <Column
            header="Contact"
            style={{ width: "25%" }}
            body={(rowData) => rowData.vendor?.supplierContact || "-"}
          />
          <Column
            header="Supplier Actions"
            style={{ width: "45%" }}
            body={(rowData) => rowData.supplierActions?.length || "-"}
          />
          <Column
            header="Supplier MSI Score"
            style={{ width: "25%" }}
            body={(rowData) =>
              rowData.supplierAssignmentSubmission?.supplierMSIScore || "-"
            }
          />
          <Column
            header="Auditor MSI Score"
            style={{ width: "25%" }}
            body={(rowData) =>
              rowData.auditorAssignmentSubmission?.auditorMSIScore || "-"
            }
          />
          <Column
            field="modified_on"
            header="Modified On"
            style={{ width: "40%" }}
            body={(rowData) =>
              rowData.modified_on
                ? new Date(rowData.modified_on).toDateString()
                : "-"
            }
          />
        </DataTable>
      </Dialog>
    </Card>
  );
};

export default OpenNonComplianceLineChart;
