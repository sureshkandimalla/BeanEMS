import React, { useEffect, useState } from "react";
import { Button, Input, Modal, message } from "antd";
import axios from "axios";
import dayjs from "dayjs";
import API_ENDPOINTS from "../config";

// Generic notes history + add-note popup — backed by the Note module
// (type/entityId, mirrors Document's entityType/entityId). Any grid can
// reuse this: pass the entity's own `type` string (e.g. "Employee",
// "Customer", "LCA", "Invoice" — matches Note.type) and its row id as
// `entityId`. Self-contained: fetches its own note list whenever it opens
// for a given entity, no state needed in the parent grid beyond "which row
// is this open for right now".
const NotesModal = ({ open, entityType, entityId, title, onClose }) => {
  const [noteList, setNoteList] = useState([]);
  const [noteText, setNoteText] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchNotes = () => {
    if (!entityId) return;
    setLoading(true);
    axios
      .get(API_ENDPOINTS.getNotesForEntity(entityType, entityId))
      .then((response) => setNoteList(Array.isArray(response.data) ? response.data : []))
      .catch(() => setNoteList([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (open) {
      setNoteText("");
      fetchNotes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, entityType, entityId]);

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    setSaving(true);
    axios
      .post(API_ENDPOINTS.createNote, { type: entityType, entityId, description: noteText })
      .then(() => {
        setNoteText("");
        fetchNotes();
      })
      .catch(() => message.error("Failed to save note. Please try again."))
      .finally(() => setSaving(false));
  };

  return (
    <Modal
      title={`Notes${title ? ` — ${title}` : ""}`}
      open={open}
      onCancel={onClose}
      footer={null}
    >
      <div style={{ maxHeight: 260, overflowY: "auto", marginBottom: 12 }}>
        {loading ? (
          <p>Loading...</p>
        ) : noteList.length === 0 ? (
          <p style={{ color: "#999" }}>No notes yet.</p>
        ) : (
          noteList.map((note) => (
            <div key={note.noteId} style={{ padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
              <div>{note.description}</div>
              <div style={{ fontSize: 12, color: "#999" }}>
                {note.date ? dayjs(note.date).format("MMM D, YYYY h:mm A") : ""}
              </div>
            </div>
          ))
        )}
      </div>
      <Input.TextArea
        rows={3}
        value={noteText}
        onChange={(e) => setNoteText(e.target.value)}
        placeholder="Add a note..."
      />
      <Button
        type="primary"
        onClick={handleAddNote}
        loading={saving}
        disabled={!noteText.trim()}
        style={{ marginTop: 8 }}
      >
        Add Note
      </Button>
    </Modal>
  );
};

export default NotesModal;
