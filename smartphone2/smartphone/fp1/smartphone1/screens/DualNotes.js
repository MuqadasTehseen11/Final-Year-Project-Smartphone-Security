import React, { useState, useEffect } from 'react';
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
    BackHandler,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { firestore } from '../firebase';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, listAll, deleteObject } from 'firebase/storage';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native'; 

const DualNotes = () => {
    const [notes, setNotes] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [currentNote, setCurrentNote] = useState({ title: '', content: '', password: '', hint: '' });
    const [isAddMode, setIsAddMode] = useState(true);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [enteredPassword, setEnteredPassword] = useState('');
    const [attempts, setAttempts] = useState(0);
    const [contextMenuVisible, setContextMenuVisible] = useState(false);
    const [selectedNoteId, setSelectedNoteId] = useState(null);
    const [confirmationVisible, setConfirmationVisible] = useState(false);
    const navigation = useNavigation();  //

    const auth = getAuth();
    const user = auth.currentUser ;

    useEffect(() => {
        if (user) {
            loadNotes(user.uid);
        }
    }, [user]);
    useEffect(() => {
            // fetchVideos();
    
            // ✅ Android Hardware Back Button Handle karo
            const backHandler =BackHandler.addEventListener("hardwareBackPress", handleBackPress);
            return () => backHandler.remove();
        }, []);
    
        const handleBackPress = () => {
            if (modalVisible) {
                setModalVisible(false);
                return true; // Stops default back action
            }
            navigation.navigate('SelectionScreen'); // ✅ Back press pe redirect
            return true;
        };
    
    

    const loadNotes = async (userId) => {
        try {
            const storage = getStorage();
            const notesRef = ref(storage, `Fake Notes/${userId}`); // Change to "Fake Notes"
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
            const userId = user.uid;
            const fileName = `${note.id}.json`;
            const storageRef = ref(storage, `Fake Notes/${userId}/${fileName}`); // Change to "Fake Notes"

            const noteBlob = new Blob([JSON.stringify(note)], { type: 'application/json' });
            const uploadTask = uploadBytesResumable(storageRef, noteBlob);

            uploadTask.on('state_changed', 
                (snapshot) => {},
                (error) => {
                    console.error("Error uploading file:", error);
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        saveFileUrlToFirestore(note.id, downloadURL, userId);
                    });
                }
            );
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

    const openModal = () => {
        setCurrentNote({ title: '', content: '', password: '', hint: '' });
        setIsAddMode(true);
        setModalVisible(true);
    };

    const closeModal = () => {
        setCurrentNote({ title: '', content: '', password: '', hint: '' });
        setModalVisible(false);
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

    const openContextMenu = (note) => {
        setSelectedNoteId(note.id);
        setCurrentNote(note);
        setContextMenuVisible(true);
    };

    const handleDeleteNote = async () => {
        console.log("Attempting to delete note with ID:", selectedNoteId);

        if (!selectedNoteId) {
            console.error("No note selected for deletion");
            return;
        }

        setNotes(prevNotes => prevNotes.filter(note => note.id !== selectedNoteId));

        try {
            const userId = user.uid;
            const storage = getStorage();

            await deleteDoc(doc(firestore, 'notes', selectedNoteId));
            console.log("Note deleted from Firestore");

            const fileRef = ref(storage, `Fake Notes/${userId}/${selectedNoteId}.json`); // Change to "Fake Notes"
            await deleteObject(fileRef);
            console.log("Note deleted from Firebase Storage");

        } catch (error) {
            console.error("Error deleting note:", error);
        }

        setConfirmationVisible(false);
        setContextMenuVisible(false);
    };

    const handleCancelDelete = () => {
        setConfirmationVisible(false);
    };
    

    const handleOpenNote = () => {
        const note = notes.find((n) => n.id === selectedNoteId);
        if (note.password) {
            setPasswordVisible(true);
        } else {
            setModalVisible(true);
            setContextMenuVisible(false);
        }
    };
    
    

    const handlePasswordSubmit = () => {
        const note = notes.find((n) => n.id === selectedNoteId);
        if (enteredPassword === note.password) {
            setModalVisible(true);
            setPasswordVisible(false);
            setEnteredPassword('');
            setAttempts(0);
        } else {
            setAttempts(attempts + 1);
            if (attempts >= 2) {
                alert(`Hint: ${note.hint}`);
            }
            setEnteredPassword('');
        }
    };

    const handleRenameNote = () => {
        setIsAddMode(false);
        setModalVisible(true);
        setContextMenuVisible(false);
    };

    const closeContextMenu = () => {
        setContextMenuVisible(false);
    };

    const updateNote = async () => {
        const updatedNote = {
            ...currentNote,
            id: selectedNoteId,
        };
        try {
            await setDoc(doc(firestore, 'notes', selectedNoteId), updatedNote);
            setNotes(notes.map((note) => (note.id === selectedNoteId ? updatedNote : note)));
        } catch (error) {
            console.error('Failed to update note in Firestore:', error);
        }
        closeModal();
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.appName}>My Notes</Text>
            </View>

            <FlatList
                data={notes}
                renderItem={({ item }) => (
                    <View style={styles.note}>
                        <TouchableOpacity
                            style={styles.noteContent}
                            onLongPress={() => openContextMenu(item)}
                            onPress={() => handleOpenNote()}
                        >
                            {item.password ? (
                                <Text style={styles.noteTitle}>{item.title} (Locked)</Text>
                            ) : (
                                <Text style={styles.noteTitle}>{item.title}</Text>
                            )}
                            <ScrollView style={styles.scrollContainer}>
                                {item.password ? null : <Text style={styles.noteDescription}>{item.content}</Text>}
                            </ScrollView>
                        </TouchableOpacity>
                    </View>
                )}
                keyExtractor={item => item.id}
                style={styles.notesContainer}
                numColumns={2}
                columnWrapperStyle={styles.row}
            />

            {/* Context Menu Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={contextMenuVisible}
                onRequestClose={closeContextMenu}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalView}>
                        <Pressable onPress={() => setConfirmationVisible(true)}>
                            <Text style={styles.menuOption}>Delete Note</Text>
                        </Pressable>
                        <Pressable onPress={handleOpenNote}>
                            <Text style={styles.menuOption}>Open Note</Text>
                        </Pressable>
                        <Pressable onPress={handleRenameNote}>
                            <Text style={styles.menuOption}>Rename Note</Text>
                        </Pressable>
                        <Pressable onPress={closeContextMenu}>
                            <Text style={styles.menuOption}>Cancel</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            {/* Confirmation Modal for Delete */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={confirmationVisible}
                onRequestClose={handleCancelDelete}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalView}>
                        <Text style={styles.confirmationText}>Are you sure you want to delete this note?</Text>
                        <Pressable onPress={handleDeleteNote} style={styles.deleteButton}>
                            <Text style={styles.saveButtonText}>Yes, Delete</Text>
                        </Pressable>
                        <Pressable onPress={handleCancelDelete} style={styles.cancelButton}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </Pressable>
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
                            style={styles.input}
                            value={enteredPassword}
                            onChangeText={setEnteredPassword}
                            placeholder="Enter Password"
                            secureTextEntry={true}
                        />
                        <Pressable
                            style={styles.saveButton}
                            onPress={handlePasswordSubmit}
                        >
                            <Text style={styles.saveButtonText}>Submit</Text>
                        </Pressable>
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
                            style={styles.input}
                            value={currentNote.title}
                            onChangeText={(text) => setCurrentNote({ ...currentNote, title: text })}
                            placeholder="Title"
                        />
                        <TextInput
                            style={styles.input}
                            value={currentNote.content}
                            onChangeText={(text) => setCurrentNote({ ...currentNote, content: text })}
                            placeholder="Content"
                            multiline={true}
                        />
                        <TextInput
                            style={styles.input}
                            value={currentNote.password}
                            onChangeText={(text) => setCurrentNote({ ...currentNote, password: text })}
                            placeholder="Password (Optional)"
                        />
                        <TextInput
                            style={styles.input}
                            value={currentNote.hint}
                            onChangeText={(text) => setCurrentNote({ ...currentNote, hint: text })}
                            placeholder="Hint (Optional)"
                        />
                        <Pressable
                            style={styles.saveButton}
                            onPress={isAddMode ? saveNote : updateNote}
                        >
                            <Text style={styles.saveButtonText}>{isAddMode ? 'Save Note' : 'Update Note'}</Text>
                        </Pressable>
                        <Pressable onPress={closeModal}>
                            <Text style={styles.cancelButton}>Cancel</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            {/* Floating Add Note Button */}
            <TouchableOpacity onPress={openModal} style={styles.addButton}>
                <TouchableOpacity onPress={() => { setModalVisible(false); navigation.navigate('SelectionScreen'); }} style={styles.closeButton}></TouchableOpacity>
                <Icon name="add" size={30} color="black" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 30, backgroundColor: 'black' },
    header: { padding: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black' },
    appName: { fontSize: 25, fontWeight: 'bold', color: 'green', marginTop: 5 },
    notesContainer: { flex: 1 },
    note: { flex: 1, padding: 10 },
    noteTitle: { fontSize: 18, fontWeight: 'bold', color: 'black' },
    noteDescription: { fontSize: 16, color: 'white' },
    noteContent: { backgroundColor: 'green', padding: 10, borderRadius: 5 },
    row: { flexDirection: 'row', flexWrap: 'wrap' },
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalView: { backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%' },
    input: { height: 40, borderBottomWidth: 1, marginBottom: 10, paddingLeft: 10, borderColor: 'red', color: 'black' },
    saveButton: { padding: 10, marginTop: 10, borderRadius: 5, backgroundColor: 'green' },
    saveButtonText: { color: 'black', fontSize: 18, textAlign: 'center' },
    cancelButton: { color: 'red', textAlign: 'center', marginTop: 10,fontSize: 15 },
    addButton: { position: 'absolute', bottom: 20, right: 20, backgroundColor: 'green', padding: 15, borderRadius: 50 },
    menuOption: { fontSize: 18, padding: 10, textAlign: 'center', color: 'black' },
    confirmationText: { fontSize: 18, textAlign: 'center', marginBottom: 10, color: 'white' },
    deleteButton: { padding: 10, marginTop: 10, borderRadius: 5, backgroundColor: 'red' },
});

export default DualNotes;