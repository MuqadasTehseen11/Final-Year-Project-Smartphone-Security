import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    Pressable,
    StyleSheet,
    FlatList,
    TextInput,
    ScrollView,
    Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ThemeContext } from './ThemeContext';
import { firestore } from '../firebase';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, listAll, deleteObject } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const { width, height } = Dimensions.get('window');

const NotesScreen = () => {
    const { currentTheme } = useContext(ThemeContext);
    const [notes, setNotes] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [currentNote, setCurrentNote] = useState({ title: '', content: '', password: '', hint: '' });
    const [isAddMode, setIsAddMode] = useState(true);
    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [enteredPassword, setEnteredPassword] = useState('');
    const [attempts, setAttempts] = useState(0);
    const [contextMenuVisible, setContextMenuVisible] = useState(false);
    const [selectedNoteId, setSelectedNoteId] = useState(null);
    const [removePasswordVisible, setRemovePasswordVisible] = useState(false);
    const [confirmationVisible, setConfirmationVisible] = useState(false);

    const auth = getAuth();
    const user = auth.currentUser ;

    useEffect(() => {
        if (user) {
            loadNotes(user.uid);
        }
    }, [user]);

    const loadNotes = async (userId) => {
        try {
            const storage = getStorage();
            const userEmail = user.email.replace('@', '').replace('.', '');
            const notesRef = ref(storage, `users/${userEmail}/Notes/`);
            const listResult = await listAll(notesRef);
            const notesList = [];
            for (const item of listResult.items) {
                const downloadURL = await getDownloadURL(item);
                const noteData = await fetch(downloadURL).then(res => res.json());
                notesList.push({
                    id: item.name.split('.')[0],
                    ...noteData,
                });
            }
            setNotes(notesList);
        } catch (error) {
            console.error('Failed to load notes from Firebase Storage:', error);
        }
    };

    const saveNoteToFirebaseStorage = async (note) => {
        try {
            const storage = getStorage();
            const userEmail = user.email.replace('@', '').replace('.', '');
            const fileName = `${note.id}.json`;
            const storageRef = ref(storage, `users/${userEmail}/Notes/${fileName}`);

            const noteBlob = new Blob([JSON.stringify(note)], { type: 'application/json' });
            await uploadBytesResumable(storageRef, noteBlob).then((snapshot) => {
                getDownloadURL(snapshot.ref).then((downloadURL) => {
                    saveFileUrlToFirestore(note.id, downloadURL, user.uid);
                });
            });
        } catch (error) {
            console.error('Failed to save note to Firebase Storage:', error);
        }
    };

    const saveFileUrlToFirestore = async (noteId, downloadURL, userId) => {
        try {
            const noteRef = doc(firestore, 'notes', noteId);
            await setDoc(noteRef, { fileUrl: downloadURL, userId }, { merge: true });
        } catch (error) {
            console.error('Failed to save file URL to Firestore:', error);
        }
    };

    const handleDeleteNote = async () => {
        if (!selectedNoteId) {
            console.warn("No note selected for deletion");
            return;
        }

        if (!user) {
            console.error("User  not authenticated");
            alert("You must be logged in to delete notes.");
            return;
        }

        try {
            const userEmail = user.email.replace('@', '').replace('.', '');
            const storage = getStorage();
            const storageFileRef = ref(storage, `users/${userEmail}/Notes/${selectedNoteId}.json`);

            // Step 1: Delete from Storage
            console.log("Attempting to delete from Storage:", storageFileRef.fullPath);
            await deleteObject(storageFileRef);
            console.log("Note deleted from Storage successfully");

            // Step 2: Update local state
            setNotes(prevNotes => prevNotes.filter(note => note.id !== selectedNoteId));
            console.log("Local state updated successfully");

            // Close modals
            setConfirmationVisible(false);
            setContextMenuVisible(false);
        } catch (error) {
            console.error("Error deleting note from Storage:", error);
            alert("Failed to delete note from Storage. Check console for details.");
        }
    };

    const openModal = () => {
        setCurrentNote({ title: '', content: '', password: '', hint: '' });
        setIsAddMode(true);
        setShowPasswordFields(false);
        setModalVisible(true);
    };

    const closeModal = () => {
        setCurrentNote({ title: '', content: '', password: '', hint: '' });
        setModalVisible(false);
        setShowPasswordFields(false);
    };

    const saveNote = () => {
        const newNote = {
            id: Date.now().toString(),
            title: currentNote.title,
            content: currentNote.content,
            password: currentNote.password,
            hint: currentNote.hint,
        };
        setNotes([...notes, newNote]);
        saveNoteToFirebaseStorage(newNote);
        closeModal();
    };

    const updateNote = async () => {
        const updatedNote = { ...currentNote, id: selectedNoteId };
        setNotes(notes.map(note => (note.id === selectedNoteId ? updatedNote : note)));
        await saveNoteToFirebaseStorage(updatedNote);
        closeModal();
    };

    const openContextMenu = (note) => {
        setSelectedNoteId(note.id);
        setCurrentNote(note);
        setContextMenuVisible(true);
    };

    const handleOpenNote = (noteId) => {
        const note = notes.find((n) => n.id === noteId);
        setSelectedNoteId(noteId);
        setCurrentNote(note);
        if (note.password) {
            setPasswordVisible(true);
        } else {
            setIsAddMode(false);
            setShowPasswordFields(false);
            setModalVisible(true);
        }
    };

    const handlePasswordSubmit = () => {
        const note = notes.find((n) => n.id === selectedNoteId);
        if (enteredPassword === note.password) {
            setModalVisible(true);
            setPasswordVisible(false);
            setIsAddMode(false);
            setShowPasswordFields(false);
            setEnteredPassword('');
            setAttempts(0);
        } else {
            setAttempts(attempts + 1);
            if ((attempts + 1) % 4 === 0) {
                alert(`Hint: ${note.hint}`);
            }
            setEnteredPassword('');
        }
    };

    const handleEditNote = () => {
        setIsAddMode(false);
        setShowPasswordFields(false);
        setModalVisible(true);
        setContextMenuVisible(false);
    };

    const handleAddPassword = () => {
        setIsAddMode(false);
        setShowPasswordFields(true);
        setModalVisible(true);
        setContextMenuVisible(false);
    };

    const handleRemovePassword = () => {
        setContextMenuVisible(false);
        setRemovePasswordVisible(true);
    };

    const handleRemovePasswordSubmit = () => {
        const note = notes.find((n) => n.id === selectedNoteId);
        if (enteredPassword === note.password) {
            const updatedNote = { ...note, password: '', hint: '' };
            setNotes(notes.map(n => (n.id === selectedNoteId ? updatedNote : n)));
            saveNoteToFirebaseStorage(updatedNote);
            setRemovePasswordVisible(false);
            setEnteredPassword('');
            setAttempts(0);
        } else {
            setAttempts(attempts + 1);
            if ((attempts + 1) % 4 === 0) {
                alert(`Hint: ${note.hint}`);
            }
            setEnteredPassword('');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: currentTheme.primary }]}>
            <View style={[styles.header, { backgroundColor: currentTheme.accent }]}>
                <Text style={[styles.appName, { color: currentTheme.primary }]}>My Notes</Text>
            </View>

            <FlatList
                data={notes}
                renderItem={({ item }) => (
                    <View style={styles.note}>
                        <TouchableOpacity
                            style={styles.noteContent}
                            onLongPress={() => openContextMenu(item)}
                            onPress={() => handleOpenNote(item.id)}
                        >
                            {item.password ? (
                                <Text style={[styles.noteTitle, { color: currentTheme.accent }]}>{item.title} (Locked)</Text>
                            ) : (
                                <Text style={[styles.noteTitle, { color: currentTheme.accent }]}>{item.title}</Text>
                            )}
                            <ScrollView style={styles.scrollContainer}>
                                {item.password ? null : <Text style={[styles.noteDescription, { color: currentTheme.text }]}>{item.content}</Text>}
                            </ScrollView>
                        </TouchableOpacity>
                    </View>
                )}
                keyExtractor={item => item.id}
                style={styles.notesContainer}
                numColumns={width > 600 ? 3 : 2}
                columnWrapperStyle={styles.row}
            />

            {/* Context Menu Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={contextMenuVisible}
                onRequestClose={() => setContextMenuVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalView}>
                        <Pressable onPress={() => setConfirmationVisible(true)}>
                            <Text style={styles.menuOption}>Delete Note</Text>
                        </Pressable>
                        <Pressable onPress={() => {
                            handleOpenNote(selectedNoteId);
                            setContextMenuVisible(false);
                        }}>
                            <Text style={styles.menuOption}>Open Note</Text>
                        </Pressable>
                        <Pressable onPress={() => {
                            handleEditNote();
                            setContextMenuVisible(false);
                        }}>
                            <Text style={styles.menuOption}>Edit Note</Text>
                        </Pressable>
                        {!currentNote.password && (
                            <Pressable onPress={() => {
                                handleAddPassword();
                                setContextMenuVisible(false);
                            }}>
                                <Text style={styles.menuOption}>Add Password</Text>
                            </Pressable>
                        )}
                        {currentNote.password && (
                            <Pressable onPress={() => {
                                handleRemovePassword();
                                setContextMenuVisible(false);
                            }}>
                                <Text style={styles.menuOption}>Remove Password</Text>
                            </Pressable>
                        )}
                        <Pressable onPress={() => setContextMenuVisible(false)}>
                            <Text style={styles.menuOption}>Cancel</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={confirmationVisible}
                onRequestClose={() => setConfirmationVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalView}>
                        <Text style={styles.confirmationText}>Do you want to delete this note?</Text>
                        <View style={styles.buttonRow}>
                            <Pressable
                                style={[styles.saveButton, { backgroundColor: 'red' }]}
                                onPress={handleDeleteNote}
                            >
                                <Text style={styles.saveButtonText}>Yes</Text>
                            </Pressable>
                            <Pressable
                                style={styles.cancelButton}
                                onPress={() => setConfirmationVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Password Input Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={passwordVisible}
                onRequestClose={() => setPasswordVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalView}>
                        <TextInput
                            style={[styles.input, { borderColor: currentTheme.accent }]}
                            value={enteredPassword}
                            onChangeText={setEnteredPassword}
                            placeholder="Enter Password"
                            secureTextEntry={true}
                        />
                        <View style={styles.buttonRow}>
                            <Pressable
                                style={[styles.saveButton, { backgroundColor: currentTheme.primary }]}
                                onPress={handlePasswordSubmit}
                            >
                                <Text style={styles.saveButtonText}>Submit</Text>
                            </Pressable>
                            <Pressable onPress={() => setPasswordVisible(false)} style={styles.cancelButton}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Remove Password Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={removePasswordVisible}
                onRequestClose={() => setRemovePasswordVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalView}>
                        <TextInput
                            style={[styles.input, { borderColor: currentTheme.accent }]}
                            value={enteredPassword}
                            onChangeText={setEnteredPassword}
                            placeholder="Enter Password to Remove"
                            secureTextEntry={true}
                        />
                        <View style={styles.buttonRow}>
                            <Pressable
                                style={[styles.saveButton, { backgroundColor: currentTheme.primary }]}
                                onPress={handleRemovePasswordSubmit}
                            >
                                <Text style={styles.saveButtonText}>Remove Password</Text>
                            </Pressable>
                            <Pressable onPress={() => setRemovePasswordVisible(false)} style={styles.cancelButton}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Add/Edit Note Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalView}>
                        <TextInput
                            style={[styles.titleInput, { borderColor: currentTheme.accent }]}
                            value={currentNote.title}
                            onChangeText={(text) => setCurrentNote({ ...currentNote, title: text })}
                            placeholder="Title"
                        />
                        <TextInput
                            style={[styles.contentInput, { borderColor: currentTheme.accent }]}
                            value={currentNote.content}
                            onChangeText={(text) => setCurrentNote({ ...currentNote, content: text })}
                            placeholder="Content"
                            multiline={true}
                            textAlignVertical="top"
                        />
                        {showPasswordFields && (
                            <>
                                <TextInput
                                    style={[styles.input, { borderColor: currentTheme.accent }]}
                                    value={currentNote.password}
                                    onChangeText={(text) => setCurrentNote({ ...currentNote, password: text })}
                                    placeholder="Password"
                                    secureTextEntry={true}
                                />
                                <TextInput
                                    style={[styles.input, { borderColor: currentTheme.accent }]}
                                    value={currentNote.hint}
                                    onChangeText={(text) => setCurrentNote({ ...currentNote, hint: text })}
                                    placeholder="Hint"
                                />
                            </>
                        )}
                        <View style={styles.buttonRow}>
                            <Pressable
                                style={[styles.saveButton, { backgroundColor: currentTheme.primary }]}
                                onPress={isAddMode ? saveNote : updateNote}
                            >
                                <Text style={styles.saveButtonText}>{isAddMode ? 'Save Note' : 'Update Note'}</Text>
                            </Pressable>
                            <Pressable onPress={closeModal} style={styles.cancelButton}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            <TouchableOpacity onPress={openModal} style={styles.addButton}>
                <Icon name="add" size={width * 0.08} color={currentTheme.primary} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: '1%',
    },
    header: {
        paddingVertical: height * 0.02,
        paddingHorizontal: width * 0.03,
        justifyContent: 'center',
        alignItems: 'center',
    },
    appName: {
        fontSize: width * 0.07,
        fontWeight: 'bold',
        marginTop: height * 0.01,
    },
    notesContainer: {
        flex: 1,
        paddingHorizontal: width * 0.02,
    },
    note: {
        flex: 1,
        padding: width * 0.03,
        maxWidth: width > 600 ? width / 3 - width * 0.04 : width / 2 - width * 0.04,
    },
    noteTitle: {
        fontSize: width * 0.045,
        fontWeight: 'bold',
    },
    noteDescription: {
        fontSize: width * 0.04,
    },
    noteContent: {
        backgroundColor: '#fff',
        padding: width * 0.03,
        borderRadius: 5,
        minHeight: height * 0.15,
    },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        backgroundColor: 'white',
        padding: width * 0.05,
        borderRadius: 10,
        width: width * 0.85,
        maxHeight: height * 0.7,
    },
    titleInput: {
        height: height * 0.06,
        borderBottomWidth: 1,
        marginBottom: height * 0.02,
        paddingLeft: 0,
        paddingBottom: 0,
        fontSize: width * 0.04,
    },
    contentInput: {
        height: height * 0.15,
        borderWidth: 1,
        marginBottom: height * 0.02,
        paddingLeft: width * 0.01,
        paddingTop: width * 0.01,
        fontSize: width * 0.04,
    },
    input: {
        height: height * 0.06,
        borderBottomWidth: 1,
        marginBottom: height * 0.02,
        paddingLeft: width * 0.03,
        fontSize: width * 0.04,
    },
    saveButton: {
        padding: width * 0.03,
        marginTop: height * 0.02,
        borderRadius: 5,
        flex: 1,
        marginHorizontal: width * 0.01,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: width * 0.045,
        textAlign: 'center',
    },
    cancelButton: {
        padding: width * 0.03,
        marginTop: height * 0.02,
        flex: 1,
        marginHorizontal: width * 0.01,
    },
    cancelButtonText: {
        fontSize: width * 0.045,
        textAlign: 'center',
        color: 'blue',
    },
    addButton: {
        position: 'absolute',
        bottom: height * 0.03,
        right: width * 0.05,
        backgroundColor: '#FFCA42',
        padding: width * 0.04,
        borderRadius: width * 0.5,
    },
    menuOption: {
        fontSize: width * 0.045,
        padding: width * 0.03,
        textAlign: 'center',
    },
    scrollContainer: {
        maxHeight: height * 0.1,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    confirmationText: {
        fontSize: width * 0.045,
        textAlign: 'center',
        marginBottom: height * 0.02,
    },
});

export default NotesScreen;