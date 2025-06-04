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
import supplierAssessmentData from "../data/supplierAssignment_Audit_Actions.json";
import categoryData from "../data/categories.json";

const SAvsCalibrationChart = () => {
  const [chartType, setChartType] = useState("column");
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

  const totalSAScore = filteredData.reduce((sum, d) => {
    return sum + (d.supplierAssignmentSubmission?.supplierMSIScore || 0);
  }, 0);

  const totalCalibrationScore = filteredData.reduce((sum, d) => {
    return sum + (d.auditorAssignmentSubmission?.auditorMSIScore || 0);
  }, 0);

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
                  name: "Self Assessment Score",
                  y: totalSAScore,
                  events: {
                    click: () => {
                      const data = filteredData.filter(
                        (d) => d.supplierAssignmentSubmission?.supplierMSIScore
                      );
                      setModalTitle("Self Assessment Score");
                      setModalData(data);
                      setModalVisible(true);
                    },
                  },
                },
                {
                  name: "Calibration Score",
                  y: totalCalibrationScore,
                  events: {
                    click: () => {
                      const data = filteredData.filter(
                        (d) => d.auditorAssignmentSubmission?.auditorMSIScore
                      );
                      setModalTitle("Calibration Score");
                      setModalData(data);
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
      : {
          chart: { type: chartType, animation: true },
          title: { text: null },
          xAxis: { categories: ["Scores"] },
          yAxis: { min: 0, title: { text: "Score" } },
          series: [
            {
              name: "Self Assessment Score",
              data: [totalSAScore],
              point: {
                events: {
                  click: () => {
                    const data = filteredData.filter(
                      (d) => d.supplierAssignmentSubmission?.supplierMSIScore
                    );
                    setModalTitle("Self Assessment Score");
                    setModalData(data);
                    setModalVisible(true);
                  },
                },
              },
            },
            {
              name: "Calibration Score",
              data: [totalCalibrationScore],
              point: {
                events: {
                  click: () => {
                    const data = filteredData.filter(
                      (d) => d.auditorAssignmentSubmission?.auditorMSIScore
                    );
                    setModalTitle("Calibration Score");
                    setModalData(data);
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
      field: "supplierAssignmentSubmission.supplierMSIScore",
      header: "Self Assessment Score",
      body: (row) => row.supplierAssignmentSubmission?.supplierMSIScore ?? "-",
    },
    {
      field: "auditorAssignmentSubmission.auditorMSIScore",
      header: "Calibration Score",
      body: (row) => row.auditorAssignmentSubmission?.auditorMSIScore ?? "-",
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
        <div className="flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <input
              type="search"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Global Search"
              className="p-inputtext p-component p-inputtext-sm"
            />
          </span>

          <Button
            label="Export to CSV"
            icon="pi pi-download"
            onClick={() => dt.current.exportCSV()}
            className="p-button-primary p-inputtext-sm"
          />
        </div>
        
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

export default SAvsCalibrationChart;
