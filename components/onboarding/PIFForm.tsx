"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  onboardingId: string;
  prefill: Record<string, string | boolean>;
  equipmentPackages: { id: string; name: string; hardwareType: string; peripherals: string[]; roleFamily: string }[];
};

export function PIFForm({ onboardingId, prefill, equipmentPackages }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<string>("");

  const pkg = equipmentPackages.find((p) => p.id === selectedPackage);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);

    const res = await fetch(`/api/onboarding/${onboardingId}/pif`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pifType: form.get("pifType"),
        employeeName: form.get("employeeName"),
        jobReqNumber: form.get("jobReqNumber"),
        referrerName: form.get("referrerName") || null,
        recruiterName: form.get("recruiterName"),
        agencyName: form.get("agencyName") || null,
        agencyFee: form.get("agencyFee") || null,
        positionTitle: form.get("positionTitle"),
        officeLocation: form.get("officeLocation"),
        country: form.get("country"),
        neoLocation: form.get("neoLocation"),
        employeeType: form.get("employeeType"),
        bonusCommissionPlan: form.get("bonusCommissionPlan") || null,
        payRate: form.get("payRate") || null,
        billRate: form.get("billRate") || null,
        managerName: form.get("managerName"),
        accountingCode: form.get("accountingCode"),
        supervisorRole: form.get("supervisorRole") === "on",
        billable: form.get("billable") === "true",
        salesforceAccess: form.get("salesforceAccess") === "on",
        cpqPermissions: form.get("cpqPermissions") === "on",
        kimbleApproval: form.get("kimbleApproval") === "on",
        kimbleTimeEntry: form.get("kimbleTimeEntry") === "on",
        businessCards: form.get("businessCards") === "on",
        itEquipmentNeeded: form.get("itEquipmentNeeded") !== "off",
        client: form.get("client") || null,
        drugScreenRequired: form.get("drugScreenRequired") === "on",
        tbTestRequired: form.get("tbTestRequired") === "on",
        additionalBGCheck: form.get("additionalBGCheck") === "on",
        desiredAlias: form.get("desiredAlias") || null,
        hardwareType: pkg?.hardwareType ?? form.get("hardwareType"),
        peripherals: pkg?.peripherals ?? [],
        deliveryMethod: form.get("deliveryMethod"),
        businessReason: form.get("businessReason") || null,
        additionalInfo: form.get("additionalInfo") || null,
        equipmentPackageId: selectedPackage || null,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Failed to submit PIF");
      return;
    }

    router.refresh();
  }

  const inputClass = "w-full bg-denali-gray-800 border border-denali-gray-700 rounded-lg px-3 py-2 text-sm text-denali-gray-200 focus:outline-none focus:ring-1 focus:ring-denali-cyan";
  const labelClass = "block text-xs font-medium text-denali-gray-400 mb-1";
  const sectionClass = "bg-denali-gray-900 rounded-xl border border-denali-gray-800 p-6";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="p-3 bg-red-950/30 border border-red-900/30 rounded-lg text-sm text-red-300">{error}</div>}

      {/* Section 1: Candidate Info */}
      <div className={sectionClass}>
        <h2 className="text-sm font-semibold text-denali-cyan uppercase tracking-wider mb-4">1. Candidate Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label className={labelClass}>PIF Type *</label><select name="pifType" defaultValue="NEW_HIRE" className={inputClass}><option value="NEW_HIRE">New Hire</option><option value="REHIRE">Rehire</option><option value="INTERNAL_TRANSFER">Internal Transfer</option></select></div>
          <div><label className={labelClass}>Employee Name *</label><input name="employeeName" required defaultValue={prefill.employeeName as string} className={inputClass} /></div>
          <div><label className={labelClass}>Job Requisition # *</label><input name="jobReqNumber" required defaultValue={prefill.jobReqNumber as string} className={inputClass} /></div>
          <div><label className={labelClass}>Referrer Name</label><input name="referrerName" className={inputClass} /></div>
          <div><label className={labelClass}>Recruiter Name</label><input name="recruiterName" defaultValue={prefill.recruiterName as string} className={inputClass} /></div>
          <div><label className={labelClass}>Desired Email Alias</label><input name="desiredAlias" placeholder="firstname.lastname" className={inputClass} /></div>
        </div>
      </div>

      {/* Section 2: Employment Details */}
      <div className={sectionClass}>
        <h2 className="text-sm font-semibold text-denali-cyan uppercase tracking-wider mb-4">2. Employment Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label className={labelClass}>Position Title *</label><input name="positionTitle" required defaultValue={prefill.positionTitle as string} className={inputClass} /></div>
          <div><label className={labelClass}>Employee Type</label><select name="employeeType" defaultValue={prefill.employeeType as string} className={inputClass}><option value="">Select</option><option value="1">Type 1 - Salaried Exempt</option><option value="2">Type 2 - Salaried Non-Exempt</option><option value="3">Type 3 - Hourly</option><option value="4">Type 4 - Contractor</option></select></div>
          <div><label className={labelClass}>Billable</label><select name="billable" defaultValue={prefill.billable ? "true" : "false"} className={inputClass}><option value="true">Yes</option><option value="false">No</option></select></div>
          <div><label className={labelClass}>Pay Rate</label><input name="payRate" placeholder="$45.00/hr or $95,000/yr" className={inputClass} /></div>
          <div><label className={labelClass}>Bill Rate</label><input name="billRate" placeholder="$65.00/hr" className={inputClass} /></div>
          <div><label className={labelClass}>Bonus/Commission Plan</label><input name="bonusCommissionPlan" className={inputClass} /></div>
          <div><label className={labelClass}>Manager Name *</label><input name="managerName" required defaultValue={prefill.managerName as string} className={inputClass} /></div>
          <div><label className={labelClass}>Accounting Code *</label><input name="accountingCode" required defaultValue={prefill.accountingCode as string} className={inputClass} /></div>
          <div><label className={labelClass}>Office Location *</label><input name="officeLocation" required defaultValue={prefill.officeLocation as string} className={inputClass} /></div>
          <div><label className={labelClass}>Country</label><input name="country" defaultValue={prefill.country as string} className={inputClass} /></div>
          <div><label className={labelClass}>NEO Location</label><select name="neoLocation" className={inputClass}><option value="Redmond">Redmond (Onsite)</option><option value="WebEx">WebEx (Remote)</option></select></div>
          <div><label className={labelClass}>Agency / Fee</label><input name="agencyName" placeholder="Agency name" className={inputClass} /><input name="agencyFee" placeholder="Fee %" className={`${inputClass} mt-1`} /></div>
        </div>
      </div>

      {/* Section 3: System Access */}
      <div className={sectionClass}>
        <h2 className="text-sm font-semibold text-denali-cyan uppercase tracking-wider mb-4">3. System Access</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: "salesforceAccess", label: "Salesforce CRM" },
            { name: "cpqPermissions", label: "CPQ Permissions" },
            { name: "kimbleApproval", label: "Kimble Approval Access" },
            { name: "kimbleTimeEntry", label: "Kimble Time Entry", defaultChecked: true },
            { name: "supervisorRole", label: "Supervisor/Management Role" },
            { name: "businessCards", label: "Business Cards" },
          ].map((item) => (
            <label key={item.name} className="flex items-center gap-2 p-3 bg-denali-gray-800 rounded-lg cursor-pointer hover:bg-denali-gray-700 transition-colors">
              <input type="checkbox" name={item.name} defaultChecked={item.defaultChecked} className="rounded border-denali-gray-600 bg-denali-gray-700 text-denali-cyan focus:ring-denali-cyan" />
              <span className="text-sm text-denali-gray-300">{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Section 4: Client & Compliance */}
      <div className={sectionClass}>
        <h2 className="text-sm font-semibold text-denali-cyan uppercase tracking-wider mb-4">4. Client & Compliance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label className={labelClass}>Client</label><input name="client" defaultValue={prefill.client as string} className={inputClass} /></div>
          <label className="flex items-center gap-2 p-3 bg-denali-gray-800 rounded-lg">
            <input type="checkbox" name="drugScreenRequired" defaultChecked={prefill.drugScreenRequired as boolean} className="rounded border-denali-gray-600 bg-denali-gray-700 text-denali-cyan" />
            <span className="text-sm text-denali-gray-300">Drug Screen Required</span>
          </label>
          <label className="flex items-center gap-2 p-3 bg-denali-gray-800 rounded-lg">
            <input type="checkbox" name="tbTestRequired" defaultChecked={prefill.tbTestRequired as boolean} className="rounded border-denali-gray-600 bg-denali-gray-700 text-denali-cyan" />
            <span className="text-sm text-denali-gray-300">TB Test/Vaccinations Required</span>
          </label>
          <label className="flex items-center gap-2 p-3 bg-denali-gray-800 rounded-lg">
            <input type="checkbox" name="additionalBGCheck" defaultChecked={prefill.additionalBGCheck as boolean} className="rounded border-denali-gray-600 bg-denali-gray-700 text-denali-cyan" />
            <span className="text-sm text-denali-gray-300">Additional Background Check</span>
          </label>
        </div>
      </div>

      {/* Section 5: IT Equipment */}
      <div className={sectionClass}>
        <h2 className="text-sm font-semibold text-denali-cyan uppercase tracking-wider mb-4">5. IT Equipment</h2>
        <p className="text-xs text-denali-gray-500 mb-4">Select an equipment package or customize. Packages are auto-suggested based on role family.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className={labelClass}>Equipment Package</label>
            <select value={selectedPackage} onChange={(e) => setSelectedPackage(e.target.value)} className={inputClass}>
              <option value="">Custom</option>
              {equipmentPackages.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.hardwareType} — {p.roleFamily})</option>
              ))}
            </select>
          </div>
          {!selectedPackage && (
            <>
              <div><label className={labelClass}>Hardware Type</label><select name="hardwareType" className={inputClass}><option value="PC">PC</option><option value="MAC">Mac</option></select></div>
            </>
          )}
          <div><label className={labelClass}>Delivery Method</label><select name="deliveryMethod" className={inputClass}><option value="DESK_SETUP">Desk Setup (onsite)</option><option value="SHIP_TO_HOME">Ship to Home (WFH)</option><option value="PICKUP">Pickup</option></select></div>
        </div>
        {pkg && (
          <div className="p-3 bg-denali-gray-800 rounded-lg mb-4">
            <p className="text-xs text-denali-gray-500">Package includes:</p>
            <p className="text-sm text-denali-gray-300 mt-1">{pkg.hardwareType} + {(pkg.peripherals as string[]).join(", ")}</p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className={labelClass}>Business Reason for IT Request</label><input name="businessReason" placeholder="New hire equipment" className={inputClass} /></div>
          <div><label className={labelClass}>Additional Information</label><input name="additionalInfo" placeholder="Special requirements, notes for IT" className={inputClass} /></div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => router.back()} className="px-4 py-2.5 text-sm text-denali-gray-400 hover:text-denali-gray-200 transition-colors">Cancel</button>
        <button type="submit" disabled={loading} className="px-6 py-2.5 bg-denali-cyan text-denali-black font-medium rounded-lg text-sm hover:bg-denali-cyan/90 transition-colors disabled:opacity-50">
          {loading ? "Submitting..." : "Submit PIF + IT Request"}
        </button>
      </div>
    </form>
  );
}
