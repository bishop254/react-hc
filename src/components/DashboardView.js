// DashboardOverview.tsx
import supplierAssessmentData from "../data/supplierAssignment_Audit_Actions.json";
import categoryData from "../data/categories.json";
import AssessmentDashboard from "./AssessmentDashboard";
import { Card } from "primereact/card";
import SAvsCalibrationChart from "./SAvsCalibrationChart";
import ESGChart from "./ESGChart";

const getCategoryName = (value) => {
  const cat = categoryData.find((c) => c.value === value);
  return cat ? cat.name : String(value);
};

const DashboardOverview = () => {
  return (
    <div className="p-4">
      <div className="flex flex-column md:flex-row align-items-start md:justify-content-start gap-1">
        <div className="mb-4">
          <h3 className="flex flex-row align-items-start justify-content-start">
            Dashboard Overview
          </h3>
          <p className="text-sm text-color-secondary m-0">
            This Supply Chain Analytics dashboard provides real-time visibility
            into critical supplier performance metrics.
          </p>
        </div>
      </div>

      <div className="grid">
        <div className="col-12 md:col-6 lg:col-6">
          <Card
            title={
              <div className="flex align-items-center gap-2">
                <span
                  className="text-sm"
                  style={{ color: "red", fontWeight: "bold" }}
                >
                  ●
                </span>
                Calibration Activity Trend
              </div>
            }
            className="h-full"
            style={{ borderTop: `4px solid red` }}
          >
            <AssessmentDashboard
              data={supplierAssessmentData}
              categoryOptions={categoryData}
              title="Audits Drilldown"
              dateField="auditStartDate"
              submissionField="auditorAssignmentSubmission"
              statuses={[
                { label: "Audits Scheduled", type: 0 },
                { label: "Audits Completed", type: 1 },
                { label: "Audits Released", type: 2 },
              ]}
              tableColumns={[
                { field: "vendor.supplierName", header: "Supplier" },
                { field: "vendor.supplierLocation", header: "Location" },
                {
                  field: "vendor.supplierCategory",
                  header: "Category",
                  body: (row) => getCategoryName(row.vendor.supplierCategory),
                },
                {
                  field: "auditStartDate",
                  header: "Audit Start Date",
                  body: (row) =>
                    row.auditStartDate
                      ? new Date(row.auditStartDate).toDateString()
                      : "-",
                },
              ]}
              caption="Audit summary"
              sourceText="Data source: Internal ESG Reports"
            />
          </Card>
        </div>

        <div className="col-12 md:col-6 lg:col-6">
          <Card
            title={
              <div className="flex align-items-center gap-2">
                <span
                  className="text-sm"
                  style={{ color: "yellow", fontWeight: "bold" }}
                >
                  ●
                </span>
                Self Assessment Drilldown
              </div>
            }
            className="h-full"
            style={{ borderTop: `4px solid yellow` }}
          >
            <AssessmentDashboard
              data={supplierAssessmentData}
              categoryOptions={categoryData}
              title="Self Assessment Drilldown"
              dateField="assessmentStartDate"
              submissionField="supplierAssignmentSubmission"
              statuses={[
                { label: "SA Scheduled", type: 0 },
                { label: "SA Completed", type: 1 },
              ]}
              tableColumns={[
                { field: "vendor.supplierName", header: "Supplier" },
                { field: "vendor.supplierLocation", header: "Location" },
                {
                  field: "vendor.supplierCategory",
                  header: "Category",
                  body: (row) => getCategoryName(row.vendor.supplierCategory),
                },
                {
                  field: "assessmentStartDate",
                  header: "Assessment Start Date",
                  body: (row) =>
                    row.assessmentStartDate
                      ? new Date(row.assessmentStartDate).toDateString()
                      : "-",
                },
              ]}
              caption="Self Assessment summary"
              sourceText="Data source: Internal ESG Reports"
            />
          </Card>
        </div>

        <div className="col-12 md:col-6 lg:col-6">
          <Card
            title={
              <div className="flex align-items-center gap-2">
                <span
                  className="text-sm"
                  style={{ color: "blue", fontWeight: "bold" }}
                >
                  ●
                </span>
                Suppliers Observation Drilldown
              </div>
            }
            // subTitle={"Self Assessment Drilldown"}
            className="h-full"
            style={{ borderTop: `4px solid blue` }}
          >
            <AssessmentDashboard
              data={supplierAssessmentData.filter(
                (item) => item.auditorAssignmentSubmission?.type === 2
              )}
              categoryOptions={categoryData}
              title="Observation Drilldown"
              dateField="auditEndDate"
              submissionField="supplierActions"
              statuses={[
                { label: "Good Practices", type: 1 },
                { label: "Opportunity for Improvement", type: 2 },
                { label: "Regulatory Major NC", type: 3, subtype: 1 },
                { label: "Regulatory Minor NC", type: 3, subtype: 2 },
                { label: "Minor NC", type: 3, subtype: 3 },
              ]}
              tableColumns={[
                { field: "vendor.supplierName", header: "Supplier" },
                { field: "vendor.supplierLocation", header: "Location" },
                {
                  field: "vendor.supplierCategory",
                  header: "Category",
                  body: (row) => getCategoryName(row.vendor.supplierCategory),
                },
                {
                  field: "assessmentStartDate",
                  header: "Assessment Start Date",
                  body: (row) =>
                    row.assessmentStartDate
                      ? new Date(row.assessmentStartDate).toDateString()
                      : "-",
                },
              ]}
              caption="Observation summary"
              sourceText="Data source: Internal ESG Reports"
            />
          </Card>
        </div>

        <div className="col-12 md:col-6 lg:col-6">
          <Card
            title={
              <div className="flex align-items-center gap-2">
                <span
                  className="text-sm"
                  style={{ color: "green", fontWeight: "bold" }}
                >
                  ●
                </span>
                Suppliers Action Plan Drilldown
              </div>
            }
            className="h-full"
            style={{ borderTop: `4px solid green` }}
          >
            <AssessmentDashboard
              data={supplierAssessmentData}
              categoryOptions={categoryData}
              title="Suppliers Action Plan Drilldown"
              dateField="auditStartDate"
              submissionField="auditorAssignmentSubmission"
              statuses={[
                { label: "Suppliers Completed Action-plan", type: 1 },
                { label: "Suppliers re-assessed for Action-plan", type: 0 },
                { label: "Suppliers report released", type: 2 },
              ]}
              tableColumns={[
                { field: "vendor.supplierName", header: "Supplier" },
                { field: "vendor.supplierLocation", header: "Location" },
                {
                  field: "vendor.supplierCategory",
                  header: "Category",
                  body: (row) => getCategoryName(row.vendor.supplierCategory),
                },
                {
                  field: "assessmentStartDate",
                  header: "Assessment Start Date",
                  body: (row) =>
                    row.assessmentStartDate
                      ? new Date(row.assessmentStartDate).toDateString()
                      : "-",
                },
              ]}
              caption="Self Assessment summary"
              sourceText="Data source: Internal ESG Reports"
            />
          </Card>
        </div>

        <div className="col-12 md:col-6 lg:col-6">
          <Card
            title={
              <div className="flex align-items-center gap-2">
                <span
                  className="text-sm"
                  style={{ color: "brown", fontWeight: "bold" }}
                >
                  ●
                </span>
                Self Assessment Score vs Calibration Score
              </div>
            }
            className="h-full"
            style={{ borderTop: `4px solid brown` }}
          >
            <SAvsCalibrationChart />
          </Card>
        </div>

        <div className="col-12 md:col-6 lg:col-6">
          <Card
            title={
              <div className="flex align-items-center gap-2">
                <span
                  className="text-sm"
                  style={{ color: "purple", fontWeight: "bold" }}
                >
                  ●
                </span>
                ESG Score
              </div>
            }
            className="h-full"
            style={{ borderTop: `4px solid purple` }}
          >
            <ESGChart />
          </Card>
        </div>
      </div>

      <div
        className="mt-4 border-top-1 border-200 pt-3 text-left"
        style={{ color: "#2F80ED" }}
      >
        <strong>Q2 2025 Supply Chain Focus</strong>
        <p className="text-sm mt-1">
          Our primary focus this quarter is improving supplier MSI scores and
          reducing regulatory non-compliance issues. Target: 15% improvement in
          average MSI score and 30% reduction in regulatory issues by end of
          quarter.
        </p>
      </div>
    </div>
  );
};

export default DashboardOverview;
