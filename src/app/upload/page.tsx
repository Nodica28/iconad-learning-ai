import AIFileUpload from "@/components/FileUploadComponent";
import MaterialsTable from "@/components/materials-table/MaterialsTable";

export default function Page() {
  return (
    <div className="flex gap-3">
      <div className="w-2/3">
        <MaterialsTable />
      </div>
      <div className="w-1/3">
        <AIFileUpload />
      </div>
    </div>
  );
}
