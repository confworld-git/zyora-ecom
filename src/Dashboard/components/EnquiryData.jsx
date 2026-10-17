import { useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import "../styles/Management.css";

const API = `${import.meta.env.VITE_API_BASE_URL}/api/contact`;
const config = { withCredentials: true };

const EnquiryData = ({ enquiryData, onDelete }) => {
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const visibleEnquiries = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return enquiryData;
    return enquiryData.filter((item) =>
      [
        item.name,
        item.email,
        item.phone,
        item.enquiryType,
        item.orderId,
        item.message,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [enquiryData, search]);

  const recentCount = enquiryData.filter((item) => {
    const createdAt = new Date(item.createdAt);
    const daysOld = (Date.now() - createdAt.getTime()) / (24 * 60 * 60 * 1000);
    return Number.isFinite(createdAt.getTime()) && daysOld >= 0 && daysOld < 7;
  }).length;

  const deleteEnquiry = async (enquiry) => {
    const label = enquiry.name || enquiry.email || "this enquiry";
    if (!window.confirm(`Delete the enquiry from ${label}? This can't be undone.`))
      return;

    try {
      setDeletingId(enquiry._id);
      await axios.delete(`${API}/${enquiry._id}`, config);
      onDelete(enquiry._id);
      toast.success("Enquiry deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete enquiry");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <main className="management-page">
      <header className="management-heading">
        <div>
          <span className="management-eyebrow">ENQUIRY MANAGEMENT</span>
          <h1>Enquiries</h1>
          <p>Review customer messages and contact details from your Zyora store.</p>
        </div>
      </header>

      <section className="management-stats" aria-label="Enquiry summary">
        <article><span>Total enquiries</span><strong>{enquiryData.length}</strong></article>
        <article><span>Received in the last 7 days</span><strong>{recentCount}</strong></article>
      </section>

      <div className="management-toolbar">
        <input
          aria-label="Search enquiries"
          placeholder="Search name, email, phone, enquiry type, order ID, or message"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {visibleEnquiries.length === 0 ? (
        <p className="management-empty">
          {enquiryData.length ? "No enquiries match your search." : "No enquiries have been received yet."}
        </p>
      ) : (
        <div className="management-table-wrap">
          <table className="management-table enquiries-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Enquiry Type</th>
                <th>Order ID</th>
                <th>Message</th>
                <th>Received</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleEnquiries.map((item) => (
                <tr key={item._id}>
                  <td><strong>{item.name || "—"}</strong></td>
                  <td>
                    <strong>{item.email || "—"}</strong>
                    <small>{item.phone || "—"}</small>
                  </td>
                  <td>{item.enquiryType || "—"}</td>
                  <td>{item.orderId || "—"}</td>
                  <td className="enquiry-message">{item.message || "—"}</td>
                  <td>{item.createdAt ? (
                    <>
                      {new Date(item.createdAt).toLocaleDateString("en-IN")}
                      <small>{new Date(item.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</small>
                    </>
                  ) : "—"}</td>
                  <td>
                    <div className="management-actions">
                      <button
                        type="button"
                        className="danger-action"
                        aria-label={`Delete enquiry from ${item.name || item.email || "customer"}`}
                        disabled={Boolean(deletingId)}
                        onClick={() => deleteEnquiry(item)}
                      >
                        {deletingId === item._id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
};

export default EnquiryData;
