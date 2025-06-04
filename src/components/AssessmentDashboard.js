import React, { useState, useEffect, useRef, useMemo } from "react";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { MultiSelect } from "primereact/multiselect";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";

const AssessmentDashboard = ({
  data,
  categoryOptions,
  title,
  dateField,
  submissionField,
  statuses,
  tableColumns,
  caption,
  sourceText,
}) => {
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState([]);
  const [selectedDates, setSelectedDates] = useState(null);

  const [filteredData, setFilteredData] = useState([]);
  const [buckets, setBuckets] = useState({});

  const [chartType, setChartType] = useState("column");
  const [viewMode, setViewMode] = useState("chart");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [modalTitle, setModalTitle] = useState("");

  const [globalFilter, setGlobalFilter] = useState("");
  const dt = useRef(null);

  const allLocations = useMemo(
    () => [...new Set(data.map((i) => i.vendor?.supplierLocation))],
    [data]
  );
  const allSuppliers = useMemo(
    () => [...new Set(data.map((i) => i.vendor?.supplierName))],
    [data]
  );

  const filterRelevantActions = (item, type, subtype = null) => {
    if (!Array.isArray(item[submissionField])) return item;

    const filteredActions = item[submissionField].filter(
      (action) =>
        action.categoryOfFinding === type &&
        (subtype == null || action.nonComplianceType === subtype)
    );

    if (filteredActions.length === 0) return null;

    return {
      ...item,
      [submissionField]: filteredActions,
    };
  };

  const chartOptions = useMemo(
    () => ({
      chart: { type: chartType, backgroundColor: "#FFF" },
      title: { text: null, disabld: true },
      xAxis: { type: "category" },
      yAxis: { title: { text: "Count" } },
      plotOptions: {
        series: {
          borderWidth: 0,
          dataLabels: { enabled: true, style: { textOutline: "none" } },
          point: {
            events: {
              click() {
                const match = statuses.find((s) => s.label === this.name);
                if (!match) return;

                const filtered = (buckets[this.name] || [])
                  .map((item) =>
                    filterRelevantActions(item, match.type, match.subtype)
                  )
                  .filter(Boolean);

                console.log(filtered);

                setModalTitle(this.name);
                setModalData(filtered);
                setIsModalVisible(true);
              },
            },
          },
        },
      },
      tooltip: {
        headerFormat: "<b>{series.name}</b><br>",
        pointFormat: "{point.name}: <b>{point.y}</b>",
      },
      series: [
        {
          name: title,
          colorByPoint: true,
          data: statuses.map((s) => ({
            name: s.label,
            y: (buckets[s.label] || []).length,
          })),
        },
      ],
      credits: { enabled: false },
    }),
    [chartType, title, statuses, buckets]
  );

  useEffect(() => {
    let tmp = [...data];
    if (selectedCategory.length)
      tmp = tmp.filter((d) =>
        selectedCategory.includes(d.vendor?.supplierCategory)
      );
    if (selectedLocation.length)
      tmp = tmp.filter((d) =>
        selectedLocation.includes(d.vendor?.supplierLocation)
      );
    if (selectedSupplier.length)
      tmp = tmp.filter((d) =>
        selectedSupplier.includes(d.vendor?.supplierName)
      );
    if (selectedDates) {
      const [start, end] = selectedDates;
      tmp = tmp.filter((d) => {
        const dt = new Date(d[dateField]);
        return dt >= new Date(start) && dt <= new Date(end);
      });
    }

    const b = statuses.reduce((acc, s) => ({ ...acc, [s.label]: [] }), {});
    tmp.forEach((item) => {
      const field = item[submissionField];
      if (Array.isArray(field)) {
        field.forEach((action) => {
          statuses.forEach((s) => {
            if (
              action.categoryOfFinding === s.type &&
              (s.subtype == null || action.nonComplianceType === s.subtype)
            ) {
              b[s.label].push(item);
            }
          });
        });
      } else if (field?.type != null) {
        const match = statuses.find((s) => s.type === field.type);
        if (match) b[match.label].push(item);
      }
    });

    setFilteredData(tmp);

    setBuckets(b);
  }, [
    data,
    dateField,
    submissionField,
    statuses,
    selectedCategory,
    selectedLocation,
    selectedSupplier,
    selectedDates,
  ]);

  const clearFilters = () => {
    setSelectedCategory([]);
    setSelectedLocation([]);
    setSelectedSupplier([]);
    setSelectedDates(null);
  };

  return (
    <div className="p-4">
      {/* View and Chart Type Controls */}
      <div className="flex flex-wrap align-items-center gap-2 mb-3">
        <Button
          label="Table View"
          icon="pi pi-table"
          onClick={() => setViewMode("table")}
          className={
            viewMode === "table"
              ? " p-inputtext-sm p-button-info"
              : " p-inputtext-sm p-button-outlined"
          }
        />
        <Button
          label="Chart View"
          icon="pi pi-chart-bar"
          onClick={() => setViewMode("chart")}
          className={
            viewMode === "chart"
              ? "p-inputtext-sm p-button-info"
              : "p-inputtext-sm p-button-outlined"
          }
        />
        <Dropdown
          value={chartType}
          options={[
            { label: "Column", value: "column" },
            { label: "Line", value: "line" },
            { label: "Bar", value: "bar" },
            { label: "Pie", value: "pie" },
          ]}
          onChange={(e) => {
            setChartType(e.value);
            setViewMode("chart");
          }}
          className="p-inputtext-sm"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap align-items-center gap-2 mt-3 text-sm">
        <MultiSelect
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.value)}
          options={categoryOptions}
          optionLabel="name"
          placeholder="Category"
          className="p-inputtext-sm"
        />
        <MultiSelect
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.value)}
          options={allLocations}
          placeholder="Location"
          className="p-inputtext-sm"
        />
        <MultiSelect
          value={selectedSupplier}
          onChange={(e) => setSelectedSupplier(e.value)}
          options={allSuppliers}
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
          onClick={clearFilters}
          size="small"
          className="p-button-sm p-inputtext-sm"
        />
      </div>

      <hr className="my-3" />

      {/* Chart or Table View */}
      {viewMode === "chart" ? (
        <div className="card mb-4">
          {/* <div className="text-sm font-medium text-900 mb-2">{title}</div> */}
          <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        </div>
      ) : (
        <>
          <div className="flex flex-wrap align-items-center gap-2 mb-3">
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
              label="Export to CSV"
              icon="pi pi-download"
              onClick={() => dt.current.exportCSV()}
              className="p-button-success"
            />
          </div>

          <div className="card">
            <DataTable
              value={filteredData}
              paginator
              rows={10}
              ref={dt}
              globalFilter={globalFilter}
            >
              {tableColumns.map((col) => (
                <Column
                  key={col.field}
                  field={col.field}
                  header={col.header}
                  body={col.body}
                  filter
                  filterPlaceholder={`Search ${col.header}`}
                  sortable
                />
              ))}
            </DataTable>
          </div>
        </>
      )}

      <div className="mt-3">
        <strong>Caption:</strong> {caption}
        <div className="text-sm text-color-secondary mt-1">
          <em>{sourceText}</em>
          <br />
          <em>
            Filtered by:{" "}
            {[
              selectedCategory.length &&
                `Category: ${selectedCategory.join(", ")}`,
              selectedLocation.length &&
                `Location: ${selectedLocation.join(", ")}`,
              selectedSupplier.length &&
                `Supplier: ${selectedSupplier.join(", ")}`,
              selectedDates &&
                `Dates: ${selectedDates
                  .map((d) => d.toLocaleDateString())
                  .join(" - ")}`,
            ]
              .filter(Boolean)
              .join(" | ")}
          </em>
        </div>
      </div>

      {/* Modal Dialog */}
      <Dialog
        header={modalTitle}
        visible={isModalVisible}
        style={{ width: "80vw" }}
        modal
        onHide={() => setIsModalVisible(false)}
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
          ref={dt}
          globalFilter={globalFilter}
        >
          {tableColumns.map((col) => (
            <Column
              key={col.field}
              field={col.field}
              header={col.header}
              body={col.body}
              filter
              filterPlaceholder={`Search ${col.header}`}
              sortable
            />
          ))}
        </DataTable>
      </Dialog>
    </div>
  );
};

export default AssessmentDashboard;
