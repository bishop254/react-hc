import React, { useState, useEffect, useMemo, useRef } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { MultiSelect } from "primereact/multiselect";
import { Calendar } from "primereact/calendar";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HighchartsMore from "highcharts/highcharts-more";
import supplierAssessmentData from "../data/supplierAssignment_Audit_Actions.json";
import categoryData from "../data/categories.json";
import performanceData from "../data/performance_data.json";
import { type } from "@testing-library/user-event/dist/type";

const FrameworkRadarChart = () => {
  const [chartType, setChartType] = useState("radar");
  const [viewMode, setViewMode] = useState("chart");
  const [filteredData, setFilteredData] = useState(supplierAssessmentData);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState([]);
  const [selectedDates, setSelectedDates] = useState(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalData, setModalData] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const dt = useRef(null);

  const getCategoryName = (value) => {
    const cat = categoryData.find((c) => c.value === value);
    return cat ? cat.name : String(value);
  };

  const locations = useMemo(
    () => [
      ...new Set(supplierAssessmentData.map((d) => d.vendor?.supplierLocation)),
    ],
    []
  );
  const suppliers = useMemo(
    () => [
      ...new Set(supplierAssessmentData.map((d) => d.vendor?.supplierName)),
    ],
    []
  );

  useEffect(() => {
    let temp = [...supplierAssessmentData];
    temp = temp.map((item) => {
      return {
        ...item,
        esg: getPerfomanceData(item.vendorCode) ?? {},
      };
    });

    if (selectedCategory.length)
      temp = temp.filter((d) =>
        selectedCategory.includes(d.vendor?.supplierCategory)
      );

    if (selectedLocation.length)
      temp = temp.filter((d) =>
        selectedLocation.includes(d.vendor?.supplierLocation)
      );
    if (selectedSupplier.length)
      temp = temp.filter((d) =>
        selectedSupplier.includes(d.vendor?.supplierName)
      );
    if (selectedDates) {
      const [start, end] = selectedDates;
      temp = temp.filter((d) => {
        const dt = new Date(d.modified_on);
        return dt >= new Date(start) && dt <= new Date(end);
      });
    }
    setFilteredData(temp);
  }, [
    selectedCategory,
    selectedLocation,
    selectedSupplier,
    selectedDates,
    chartType,
  ]);

  const getPerfomanceData = (vendorCode) => {
    const result = performanceData.find(
      (item) => item.vendor_code == vendorCode
    );
    return result || { environment: 0, social: 0, governance: 0 };
  };

  const totalEnvironmentalScore = +filteredData
    .reduce((sum, d) => {
      return sum + +getPerfomanceData(d.vendorCode)["environment"] || 0;
    }, 0)
    .toFixed(2);

  const totalLegalScore = +filteredData
    .reduce((sum, d) => {
      return sum + +getPerfomanceData(d.vendorCode)["legal_compliances"] || 0;
    }, 0)
    .toFixed(2);

  const totalGovernanceScore = +filteredData
    .reduce((sum, d) => {
      return (
        sum + +getPerfomanceData(d.vendorCode)["governance_framework"] || 0
      );
    }, 0)
    .toFixed(2);

  const totalHealthSafetyScore = +filteredData
    .reduce((sum, d) => {
      return sum + +getPerfomanceData(d.vendorCode)["health_safety"] || 0;
    }, 0)
    .toFixed(2);

  const totalSocialStewardshipScore = +filteredData
    .reduce((sum, d) => {
      return (
        sum +
          +getPerfomanceData(d.vendorCode)["social_stewardship_framework"] || 0
      );
    }, 0)
    .toFixed(2);

  const totalAmbassadorshipScore = +filteredData
    .reduce((sum, d) => {
      return (
        sum +
          +getPerfomanceData(d.vendorCode)[
            "supplier_sustainability_ambassadorship_framework"
          ] || 0
      );
    }, 0)
    .toFixed(2);

  const chartOptions =
    chartType === "pie"
      ? {
          chart: { type: "pie", animation: true },
          title: { text: null },
          series: [
            {
              type: "pie",
              name: "Scores",
              data: [
                {
                  name: "Environmental Framework Score",
                  y: totalEnvironmentalScore,
                  events: {
                    click: () => {
                      setModalTitle("Environmental Framework Score");
                      setModalData(filteredData);
                      setModalVisible(true);
                    },
                  },
                },
                {
                  name: "Legal Compliance Framework Score",
                  y: totalLegalScore,
                  events: {
                    click: () => {
                      setModalTitle("Legal Compliance Framework Score");
                      setModalData(filteredData);
                      setModalVisible(true);
                    },
                  },
                },
                {
                  name: "Governance FrameworkScore",
                  y: totalGovernanceScore,
                  events: {
                    click: () => {
                      setModalTitle("Governance Framework Score");
                      setModalData(filteredData);
                      setModalVisible(true);
                    },
                  },
                },
                {
                  name: "Occupational Health & Safety Framework Score",
                  y: totalHealthSafetyScore,
                  events: {
                    click: () => {
                      setModalTitle(
                        "Occupational Health & Safety Framework Score"
                      );
                      setModalData(filteredData);
                      setModalVisible(true);
                    },
                  },
                },
                {
                  name: "Social Stewardship Framework Score",
                  y: totalSocialStewardshipScore,
                  events: {
                    click: () => {
                      setModalTitle("Social Stewardship Framework Score");
                      setModalData(filteredData);
                      setModalVisible(true);
                    },
                  },
                },
                {
                  name: "Supplier Sustainability Ambassadorship Framework Score",
                  y: totalAmbassadorshipScore,
                  events: {
                    click: () => {
                      setModalTitle(
                        "Supplier Sustainability Ambassadorship Framework Score"
                      );
                      setModalData(filteredData);
                      setModalVisible(true);
                    },
                  },
                },
              ],
            },
          ],
          tooltip: {
            pointFormat: "<b>{point.name}</b>: {point.y}",
          },
          plotOptions: {
            pie: {
              allowPointSelect: true,
              cursor: "pointer",
              dataLabels: {
                enabled: true,
                format: "<b>{point.name}</b>: {point.y}",
              },
            },
          },
          credits: { enabled: false },
        }
      : chartType === "radar"
      ? {
          chart: {
            polar: true,
            type: "area",
            animation: true,
          },
          title: {
            text: "ESG Radar Chart",
          },
          pane: {
            startAngle: 0,
            endAngle: 360,
          },
          xAxis: {
            categories: [
              "Environmental Framework",
              "Legal Compliance Framework",
              "Governance Framework",
              "Occupational Health & Safety Framework",
              "Social Stewardship Framework",
              "Supplier Sustainability Ambassadorship Framework",
            ],
            tickmarkPlacement: "on",
            lineWidth: 0,
          },
          yAxis: {
            gridLineInterpolation: "polygon",
            lineWidth: 0,
            min: 0,
          },
          tooltip: {
            shared: true,
            pointFormat: "<b>{point.y}</b>",
          },
          series: [
            {
              name: "Score",
              data: [
                totalEnvironmentalScore,
                totalLegalScore,
                totalGovernanceScore,
                totalHealthSafetyScore,
                totalSocialStewardshipScore,
                totalAmbassadorshipScore,
              ],
              pointPlacement: "on",
              events: {
                click: () => {
                  setModalTitle("ESG Radar Scores");
                  setModalData(filteredData);
                  setModalVisible(true);
                },
              },
            },
          ],
          plotOptions: {
            series: {
              animation: true,
              dataLabels: {
                enabled: true,
                format: "{point.y}",
              },
            },
          },
          credits: { enabled: false },
        }
      : {
          chart: { type: chartType, animation: true },
          title: { text: null },
          xAxis: {
            categories: ["ESG Scores"],
          },
          yAxis: { min: 0, title: { text: "Score" } },
          series: [
            {
              name: "Environmental Framework Score",
              data: [totalEnvironmentalScore],
              point: {
                events: {
                  click: () => {
                    setModalTitle("Environmental Framework Score");
                    setModalData(filteredData);
                    setModalVisible(true);
                  },
                },
              },
            },
            {
              name: "Legal Compliance Framework Score",
              data: [totalLegalScore],
              point: {
                events: {
                  click: () => {
                    setModalTitle("Legal Compliance Framework Score");
                    setModalData(filteredData);
                    setModalVisible(true);
                  },
                },
              },
            },
            {
              name: "Governance Framework Score",
              data: [totalGovernanceScore],
              point: {
                events: {
                  click: () => {
                    setModalTitle("Governance Framework Score");
                    setModalData(filteredData);
                    setModalVisible(true);
                  },
                },
              },
            },
            {
              name: "Occupational Health & Safety Framework Score",
              data: [totalHealthSafetyScore],
              point: {
                events: {
                  click: () => {
                    setModalTitle(
                      "Occupational Health & Safety Framework Score"
                    );
                    setModalData(filteredData);
                    setModalVisible(true);
                  },
                },
              },
            },
            {
              name: "Social Stewardship Framework Score",
              data: [totalSocialStewardshipScore],
              point: {
                events: {
                  click: () => {
                    setModalTitle("Social Stewardship Framework Score");
                    setModalData(filteredData);
                    setModalVisible(true);
                  },
                },
              },
            },
            {
              name: "Supplier Sustainability Ambassadorship Framework Score",
              data: [totalAmbassadorshipScore],
              point: {
                events: {
                  click: () => {
                    setModalTitle(
                      "Supplier Sustainability Ambassadorship Framework Score"
                    );
                    setModalData(filteredData);
                    setModalVisible(true);
                  },
                },
              },
            },
          ],
          tooltip: {
            pointFormat: "{series.name}: <b>{point.y}</b>",
          },
          plotOptions: {
            series: {
              dataLabels: { enabled: true },
            },
          },
          credits: { enabled: false },
        };

  const tableColumns = [
    { field: "vendor.supplierName", header: "Supplier" },
    { field: "vendor.supplierLocation", header: "Location" },
    {
      field: "vendor.supplierCategory",
      header: "Category",
      body: (row) => getCategoryName(row.vendor?.supplierCategory),
    },
    {
      field: "esg.environment",
      header: "Environment Framework Score",
      body: (row) => row.esg?.environment ?? "-",
    },
    {
      field: "esg.legal_compliances",
      header: "Legal Compliance Framework Score",
      body: (row) => row.esg?.legal_compliances ?? "-",
    },
    {
      field: "esg.health_safety",
      header: "Occupational Health & Safety Framework Score",
      body: (row) => row.esg?.health_safety ?? "-",
    },
    {
      field: "esg.social_stewardship_framework",
      header: "Social Stewardship Framework Score",
      body: (row) => row.esg?.social_stewardship_framework ?? "-",
    },
    {
      field: "esg.supplier_sustainability_ambassadorship_framework",
      header: "Supplier Sustainability Ambassadorship Framework Score",
      body: (row) =>
        row.esg?.supplier_sustainability_ambassadorship_framework ?? "-",
    },
    {
      field: "esg.social",
      header: "Social Framework Score",
      body: (row) => row.esg?.social ?? "-",
    },
    {
      field: "esg.governance",
      header: "Governance Framework Score",
      body: (row) => row.esg?.governance ?? "-",
    },
    {
      field: "modified_on",
      header: "Modified On",
      body: (row) => new Date(row.modified_on).toLocaleDateString(),
    },
  ];

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-3">
        <Button
          label="Chart View"
          icon="pi pi-chart-bar"
          onClick={() => setViewMode("chart")}
          className={
            viewMode === "chart"
              ? "p-button-info p-inputtext-sm"
              : "p-button-outlined p-inputtext-sm"
          }
        />
        <Button
          label="Table View"
          icon="pi pi-table"
          onClick={() => setViewMode("table")}
          className={
            viewMode === "table"
              ? "p-button-info p-inputtext-sm"
              : "p-button-outlined p-inputtext-sm"
          }
        />
        <Dropdown
          value={chartType}
          options={[
            { label: "Radar", value: "radar" },
            { label: "Column", value: "column" },
            { label: "Bar", value: "bar" },
            { label: "Pie", value: "pie" },
          ]}
          onChange={(e) => setChartType(e.value)}
          className="p-inputtext-sm"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <MultiSelect
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.value)}
          options={categoryData}
          optionLabel="name"
          placeholder="Category"
          className="p-inputtext-sm"
        />

        <MultiSelect
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.value)}
          options={locations}
          placeholder="Location"
          className="p-inputtext-sm"
        />
        <MultiSelect
          value={selectedSupplier}
          onChange={(e) => setSelectedSupplier(e.value)}
          options={suppliers}
          placeholder="Supplier"
          className="p-inputtext-sm"
        />
        <Calendar
          value={selectedDates}
          onChange={(e) => setSelectedDates(e.value)}
          selectionMode="range"
          readOnlyInput
          hideOnRangeSelection
          placeholder="Select date range"
          className="p-inputtext-sm"
        />
        <Button
          label="Clear"
          severity="danger"
          onClick={() => {
            setSelectedCategory([]);
            setSelectedLocation([]);
            setSelectedSupplier([]);
            setSelectedDates(null);
          }}
          className="p-button-sm p-inputtext-sm"
        />
      </div>

      {viewMode === "chart" ? (
        <HighchartsReact
          key={chartType}
          highcharts={Highcharts}
          options={chartOptions}
        />
      ) : (
        <>
          <div className="flex align-items-center gap-2 mb-2">
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
              label="Export CSV"
              icon="pi pi-download"
              onClick={() => dt.current?.exportCSV()}
              className="p-button-success"
            />
          </div>
          <DataTable
            value={filteredData}
            paginator
            rows={10}
            globalFilter={globalFilter}
            ref={dt}
            responsiveLayout="scroll"
          >
            {tableColumns.map((col) => (
              <Column
                key={col.field}
                field={col.field}
                header={col.header}
                body={col.body}
                sortable
              />
            ))}
          </DataTable>
        </>
      )}

      <Dialog
        header={modalTitle}
        visible={modalVisible}
        style={{ width: "80vw" }}
        modal
        onHide={() => setModalVisible(false)}
      >
        <DataTable
          value={modalData}
          paginator
          rows={10}
          globalFilter={globalFilter}
        >
          {tableColumns.map((col) => (
            <Column
              key={col.field}
              field={col.field}
              header={col.header}
              body={col.body}
              sortable
            />
          ))}
        </DataTable>
      </Dialog>
    </>
  );
};

export default FrameworkRadarChart;
