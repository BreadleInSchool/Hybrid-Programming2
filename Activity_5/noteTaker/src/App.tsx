import React, { useState, useEffect } from 'react';
import { 
  IonApp, 
  IonContent, 
  IonPage, 
  setupIonicReact 
} from '@ionic/react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

setupIonicReact();

interface Note {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  photo?: string;
}

const App: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>(() => {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const saved = window.localStorage.getItem('notes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [showModal, setShowModal] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [photo, setPhoto] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('notes', JSON.stringify(notes));
    }
  }, [notes]);

  const takePhoto = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt // Prompts user for camera or gallery
      });
      setPhoto(image.dataUrl);
    } catch (error) {
      console.error('User cancelled or camera error:', error);
    }
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !body.trim() && !photo) return;

    const newNote: Note = {
      id: Date.now().toString(),
      title: title || 'Untitled Note',
      body: body,
      timestamp: new Date().toLocaleString(),
      photo: photo
    };

    setNotes((currentNotes) => [newNote, ...currentNotes]);
    setTitle('');
    setBody('');
    setPhoto(undefined);
    setShowModal(false);
  };

  const handleDeleteNote = (id: string) => {
    setNotes((currentNotes) => currentNotes.filter((note) => note.id !== id));
  };

  return (
    <IonApp>
      <IonPage>
        <IonContent className="bg-light">
          <div id="container" className="container py-4" style={{ maxWidth: '700px' }}>
            
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h1 className="h3 fw-bold text-dark mb-1">My Notes</h1>
                <p className="text-muted small mb-0">Offline PWA with Capacitor Camera</p>
              </div>
              <button 
                className="btn btn-primary rounded-pill px-4 shadow-sm"
                onClick={() => setShowModal(true)}
              >
                + New Note
              </button>
            </div>

            {/* Notes List */}
            {notes.length === 0 ? (
              <div className="text-center py-5 bg-white rounded-4 shadow-sm border p-5">
                <div className="text-muted mb-2 fs-4">📝</div>
                <h5 className="text-secondary">No notes yet</h5>
                <p className="text-muted small">Click the "+ New Note" button to create your first note.</p>
              </div>
            ) : (
              <div className="row g-3">
                {notes.map(note => (
                  <div className="col-12" key={note.id}>
                    <div className="card border-0 shadow-sm rounded-4 p-3 position-relative">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="card-title fw-semibold text-dark mb-0">{note.title}</h5>
                        <button 
                          className="btn btn-outline-danger btn-sm border-0 py-0 px-2"
                          onClick={() => handleDeleteNote(note.id)}
                          title="Delete note"
                        >
                          &times;
                        </button>
                      </div>
                      {note.body && (
                        <p className="card-text text-secondary mb-3" style={{ whiteSpace: 'pre-wrap' }}>
                          {note.body}
                        </p>
                      )}
                      {note.photo && (
                        <div className="mb-3">
                          <img 
                            src={note.photo} 
                            alt="Note attachment" 
                            className="img-fluid rounded-3 w-100 object-fit-cover" 
                            style={{ maxHeight: '250px' }}
                          />
                        </div>
                      )}
                      <div className="d-flex justify-content-between align-items-center pt-2 border-top text-muted" style={{ fontSize: '0.75rem' }}>
                        <span>{note.timestamp}</span>
                        <span className="badge bg-light text-dark border">Saved locally</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Bootstrap Modal for Creating a Note */}
            {showModal && (
              <div className="modal show d-block fade" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content border-0 shadow rounded-4">
                    <div className="modal-header border-0 pb-0">
                      <h5 className="modal-title fw-bold">Create New Note</h5>
                      <button 
                        type="button" 
                        className="btn-close" 
                        onClick={() => setShowModal(false)}
                      ></button>
                    </div>
                    <form onSubmit={handleSaveNote}>
                      <div className="modal-body">
                        <div className="mb-3">
                          <label htmlFor="noteTitle" className="form-label small fw-semibold text-muted">Title</label>
                          <input 
                            type="text" 
                            id="noteTitle"
                            className="form-control rounded-3" 
                            placeholder="Note title..."
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            autoFocus
                          />
                        </div>
                        <div className="mb-3">
                          <label htmlFor="noteBody" className="form-label small fw-semibold text-muted">Body</label>
                          <textarea 
                            id="noteBody"
                            className="form-control rounded-3" 
                            rows={3}
                            placeholder="Write your note here..."
                            value={body}
                            onChange={e => setBody(e.target.value)}
                          ></textarea>
                        </div>

                        {/* Camera / Photo Attachment Section */}
                        <div className="mb-3">
                          <label className="form-label small fw-semibold text-muted d-block">Photo Attachment</label>
                          {photo ? (
                            <div className="position-relative d-inline-block w-100">
                              <img 
                                src={photo} 
                                alt="Preview" 
                                className="img-fluid rounded-3 mb-2 w-100 object-fit-cover" 
                                style={{ maxHeight: '150px' }}
                              />
                              <button 
                                type="button" 
                                className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2 rounded-circle"
                                onClick={() => setPhoto(undefined)}
                                title="Remove photo"
                              >
                                &times;
                              </button>
                            </div>
                          ) : (
                            <button 
                              type="button" 
                              className="btn btn-outline-secondary w-100 rounded-3 border-dashed py-2"
                              onClick={takePhoto}
                            >
                              📷 Capture or Choose Photo
                            </button>
                          )}
                        </div>

                      </div>
                      <div className="modal-footer border-0 pt-0">
                        <button 
                          type="button" 
                          className="btn btn-light rounded-pill px-3" 
                          onClick={() => setShowModal(false)}
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="btn btn-primary rounded-pill px-4"
                        >
                          Save Note
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

          </div>
        </IonContent>
      </IonPage>
    </IonApp>
  );
};

export default App;