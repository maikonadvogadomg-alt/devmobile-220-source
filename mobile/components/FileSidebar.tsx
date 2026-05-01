import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { Paths, File as FSFile } from "expo-file-system/next";
import * as Haptics from "expo-haptics";
import * as Sharing from "expo-sharing";
import JSZip from "jszip";
import React, { useState, useMemo, useCallback, useRef } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import type { ProjectFile } from "@/context/AppContext";

// ── Ícones e cores por extensão ──────────────────────────────────────────────
function getFileStyle(name: string): { icon: string; color: string } {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  const map: Record<string, { icon: string; color: string }> = {
    ts:   { icon: "file-text", color: "#3178c6" },
    tsx:  { icon: "file-text", color: "#3178c6" },
    js:   { icon: "file-text", color: "#f7df1e" },
    jsx:  { icon: "file-text", color: "#f7df1e" },
    py:   { icon: "file-text", color: "#3572A5" },
    html: { icon: "code",      color: "#e34c26" },
    css:  { icon: "sliders",   color: "#563d7c" },
    scss: { icon: "sliders",   color: "#cc6699" },
    json: { icon: "file-text", color: "#cbcb41" },
    md:   { icon: "file-text", color: "#5b8dee" },
    sql:  { icon: "database",  color: "#336791" },
    sh:   { icon: "terminal",  color: "#89e051" },
    bash: { icon: "terminal",  color: "#89e051" },
    go:   { icon: "file-text", color: "#00ADD8" },
    rs:   { icon: "file-text", color: "#dea584" },
    java: { icon: "file-text", color: "#b07219" },
    php:  { icon: "file-text", color: "#4F5D95" },
    rb:   { icon: "file-text", color: "#cc342d" },
    yaml: { icon: "file-text", color: "#e74c3c" },
    yml:  { icon: "file-text", color: "#e74c3c" },
    env:  { icon: "file-text", color: "#f0db4f" },
    svg:  { icon: "image",     color: "#41b883" },
    png:  { icon: "image",     color: "#41b883" },
    jpg:  { icon: "image",     color: "#41b883" },
  };
  return map[ext] || { icon: "file", color: "#8b949e" };
}

// ── Tipos da árvore ──────────────────────────────────────────────────────────
interface FolderNode { type: "folder"; name: string; fullPath: string; children: TreeNode[] }
interface FileNode   { type: "file";   name: string; fullPath: string; file: ProjectFile }
type TreeNode = FolderNode | FileNode;

function buildTree(files: ProjectFile[]): TreeNode[] {
  const root: TreeNode[] = [];
  for (const file of files) {
    const rawPath = file.path?.trim() || file.name;
    const parts = rawPath.split("/").filter(Boolean);
    let current = root;
    for (let i = 0; i < parts.length - 1; i++) {
      const folderName = parts[i];
      const fullPath = parts.slice(0, i + 1).join("/");
      let folder = current.find((n): n is FolderNode => n.type === "folder" && n.name === folderName);
      if (!folder) { folder = { type: "folder", name: folderName, fullPath, children: [] }; current.push(folder); }
      current = folder.children;
    }
    current.push({ type: "file", name: parts[parts.length - 1], fullPath: rawPath, file });
  }
  function sort(nodes: TreeNode[]): TreeNode[] {
    return [...nodes]
      .sort((a, b) => { if (a.type !== b.type) return a.type === "folder" ? -1 : 1; return a.name.localeCompare(b.name); })
      .map((n) => n.type === "folder" ? { ...n, children: sort(n.children) } : n);
  }
  return sort(root);
}

// ── Sheet de contexto (bottom sheet nativo) ──────────────────────────────────
interface SheetAction { icon: string; label: string; color: string; onPress: () => void }

function ContextSheet({ title, icon, iconColor, actions, onClose }: {
  title: string; icon: string; iconColor: string; actions: SheetAction[]; onClose: () => void;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.sheetOverlay} activeOpacity={1} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: colors.card, paddingBottom: insets.bottom + 8 }]}>
        <View style={styles.sheetHandle} />
        <View style={[styles.sheetHeader, { borderBottomColor: colors.border }]}>
          <Feather name={icon as never} size={14} color={iconColor} />
          <Text style={[styles.sheetTitle, { color: colors.foreground }]} numberOfLines={1}>{title}</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Feather name="x" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>
        <ScrollView bounces={false}>
          {actions.map((a) => (
            <TouchableOpacity
              key={a.label}
              onPress={() => { onClose(); a.onPress(); }}
              style={[styles.sheetAction, { borderBottomColor: colors.border + "44" }]}
              activeOpacity={0.7}
            >
              <Feather name={a.icon as never} size={18} color={a.color} />
              <Text style={[styles.sheetActionText, { color: a.color === "#ef4444" ? "#ef4444" : colors.foreground }]}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

// ── Modal de prompt cross-platform ──────────────────────────────────────────
function PromptModal({ visible, title, subtitle, placeholder, initialValue, onConfirm, onCancel }: {
  visible: boolean; title: string; subtitle?: string; placeholder?: string;
  initialValue?: string; onConfirm: (value: string) => void; onCancel: () => void;
}) {
  const colors = useColors();
  const [value, setValue] = useState(initialValue || "");
  React.useEffect(() => { if (visible) setValue(initialValue || ""); }, [visible, initialValue]);
  if (!visible) return null;
  return (
    <Modal transparent animationType="fade" onRequestClose={onCancel}>
      <KeyboardAvoidingView style={styles.promptOverlay} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={[styles.promptBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.promptTitle, { color: colors.foreground }]}>{title}</Text>
          {subtitle && <Text style={[styles.promptSub, { color: colors.mutedForeground }]}>{subtitle}</Text>}
          <TextInput
            style={[styles.promptInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
            value={value}
            onChangeText={setValue}
            placeholder={placeholder}
            placeholderTextColor={colors.mutedForeground}
            autoFocus
            autoCorrect={false}
            autoCapitalize="none"
            onSubmitEditing={() => { if (value.trim()) { onConfirm(value.trim()); } }}
          />
          <View style={styles.promptActions}>
            <TouchableOpacity onPress={onCancel} style={[styles.promptBtn, { borderColor: colors.border }]}>
              <Text style={[styles.promptBtnText, { color: colors.mutedForeground }]}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { if (value.trim()) onConfirm(value.trim()); }}
              style={[styles.promptBtn, { backgroundColor: colors.primary, borderColor: colors.primary }]}
            >
              <Text style={[styles.promptBtnText, { color: "#fff" }]}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ── Nó da árvore ─────────────────────────────────────────────────────────────
interface NodeRowProps {
  node: TreeNode;
  depth: number;
  activeFileId: string | undefined;
  openFolders: Set<string>;
  toggleFolder: (path: string) => void;
  onOpenFile: (file: ProjectFile) => void;
  onCreateInFolder: (folderPath: string) => void;
  onCreateFolderIn: (folderPath: string) => void;
  onExportFolderZip: (folderPath: string, name: string) => void;
  onContextFile: (file: ProjectFile) => void;
}

function TreeNodeRow({
  node, depth, activeFileId, openFolders, toggleFolder,
  onOpenFile, onCreateInFolder, onCreateFolderIn, onExportFolderZip, onContextFile,
}: NodeRowProps) {
  const colors = useColors();
  const [showSheet, setShowSheet] = useState(false);
  const indent = 10 + depth * 14;

  if (node.type === "folder") {
    const open = openFolders.has(node.fullPath);
    const folderActions: SheetAction[] = [
      { icon: "file-plus",   label: "Novo Arquivo Aqui",   color: colors.primary,      onPress: () => onCreateInFolder(node.fullPath) },
      { icon: "folder-plus", label: "Nova Pasta Aqui",      color: "#f59e0b",           onPress: () => onCreateFolderIn(node.fullPath) },
      { icon: "archive",     label: "Exportar Pasta ZIP",  color: "#22c55e",           onPress: () => onExportFolderZip(node.fullPath, node.name) },
      { icon: "clipboard",   label: "Copiar Caminho",       color: colors.foreground,   onPress: () => { Clipboard.setStringAsync(node.fullPath); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } },
    ];
    return (
      <View>
        <TouchableOpacity
          onPress={() => { toggleFolder(node.fullPath); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
          style={[styles.row, { paddingLeft: indent }]}
          activeOpacity={0.7}
        >
          <Feather name={open ? "chevron-down" : "chevron-right"} size={11} color="#666" />
          <Feather name="folder" size={13} color={open ? "#f7cc6c" : "#e8b84b"} style={{ marginLeft: 2 }} />
          <Text style={[styles.label, { color: colors.foreground, fontWeight: "600", flex: 1 }]} numberOfLines={1}>{node.name}</Text>
          <TouchableOpacity
            onPress={(e) => { e.stopPropagation?.(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowSheet(true); }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.moreBtn}
          >
            <Text style={[styles.moreDot, { color: colors.mutedForeground }]}>⋮</Text>
          </TouchableOpacity>
        </TouchableOpacity>
        {open && node.children.map((child) => (
          <TreeNodeRow
            key={child.fullPath} node={child} depth={depth + 1}
            activeFileId={activeFileId} openFolders={openFolders} toggleFolder={toggleFolder}
            onOpenFile={onOpenFile} onCreateInFolder={onCreateInFolder}
            onCreateFolderIn={onCreateFolderIn} onExportFolderZip={onExportFolderZip}
            onContextFile={onContextFile}
          />
        ))}
        {showSheet && (
          <ContextSheet
            title={node.name} icon="folder" iconColor="#e8b84b"
            actions={folderActions} onClose={() => setShowSheet(false)}
          />
        )}
      </View>
    );
  }

  // Nó de arquivo
  const { file } = node;
  const { icon, color } = getFileStyle(file.name);
  const isActive = activeFileId === file.id;

  const fileActions: SheetAction[] = [
    { icon: "edit-2",   label: "Renomear",         color: "#f59e0b",          onPress: () => onContextFile(file) },
    { icon: "copy",     label: "Duplicar",          color: colors.foreground,  onPress: () => onContextFile(file) },
    { icon: "cpu",      label: "Analisar com IA",   color: "#7c3aed",          onPress: () => onContextFile(file) },
    { icon: "clipboard",label: "Copiar Caminho",    color: colors.foreground,  onPress: () => { Clipboard.setStringAsync(file.path || file.name); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } },
    { icon: "trash-2",  label: "Excluir",           color: "#ef4444",          onPress: () => onContextFile(file) },
  ];

  return (
    <TouchableOpacity
      onPress={() => onOpenFile(file)}
      style={[styles.row, { paddingLeft: indent + 16 }, isActive && { backgroundColor: colors.secondary }]}
      activeOpacity={0.75}
    >
      <Feather name={icon as never} size={12} color={isActive ? colors.primary : color} />
      <Text
        style={[styles.label, { color: isActive ? colors.primary : colors.foreground, fontWeight: isActive ? "700" : "400", flex: 1 }]}
        numberOfLines={1}
      >
        {node.name}
      </Text>
      {isActive && <View style={[styles.activeDot, { backgroundColor: colors.primary }]} />}
      <TouchableOpacity
        onPress={(e) => { e.stopPropagation?.(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowSheet(true); }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={styles.moreBtn}
      >
        <Text style={[styles.moreDot, { color: colors.mutedForeground }]}>⋮</Text>
      </TouchableOpacity>
      {showSheet && (
        <ContextSheet
          title={file.name} icon={icon as never} iconColor={color}
          actions={fileActions} onClose={() => setShowSheet(false)}
        />
      )}
    </TouchableOpacity>
  );
}

// ── FileSidebar principal ─────────────────────────────────────────────────────
interface FileSidebarProps {
  onClose?: () => void;
  onAnalyzeWithAI?: (file: ProjectFile) => void;
  onMemoryPress?: () => void;
  onMenuPress?: () => void;
}

export default function FileSidebar({ onClose, onAnalyzeWithAI, onMemoryPress, onMenuPress }: FileSidebarProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { activeProject, activeFile, setActiveFile, createFile, deleteFile, renameFile } = useApp();

  // Pastas abertas — persiste durante a sessão
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());
  const toggleFolder = useCallback((path: string) => {
    setOpenFolders((prev) => { const n = new Set(prev); n.has(path) ? n.delete(path) : n.add(path); return n; });
  }, []);

  // "Criar arquivo" com prefixo de pasta
  const [creating, setCreating] = useState(false);
  const [newName, setNewName]   = useState("");
  const createInputRef = useRef<TextInput>(null);

  // Prompt modal cross-platform
  const [prompt, setPrompt] = useState<{
    title: string; subtitle?: string; placeholder?: string;
    initialValue?: string; onConfirm: (v: string) => void;
  } | null>(null);
  const showPrompt = (cfg: typeof prompt) => setPrompt(cfg);

  // Context file (para ContextSheet)
  const [contextFile, setContextFile] = useState<ProjectFile | null>(null);

  const tree = useMemo(() => buildTree(activeProject?.files ?? []), [activeProject?.files]);

  // ── Criar arquivo ──────────────────────────────────────────────────────────
  const startCreate = (folderPath = "") => {
    setNewName(folderPath ? `${folderPath}/` : "");
    setCreating(true);
    setTimeout(() => createInputRef.current?.focus(), 80);
  };

  const confirmCreate = () => {
    if (!newName.trim() || !activeProject) return;
    const filePath = newName.trim();
    const file = createFile(activeProject.id, filePath);
    setActiveFile(file);
    // Abre a pasta pai automaticamente
    const parentPath = filePath.includes("/") ? filePath.split("/").slice(0, -1).join("/") : "";
    if (parentPath) setOpenFolders((p) => new Set([...p, ...parentPath.split("/").map((_, i, arr) => arr.slice(0, i + 1).join("/"))]));
    setCreating(false);
    setNewName("");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  // ── Criar pasta ────────────────────────────────────────────────────────────
  const createFolderIn = (parentPath: string) => {
    showPrompt({
      title: "Nova Pasta",
      subtitle: parentPath ? `Dentro de: ${parentPath}` : undefined,
      placeholder: "nome-da-pasta",
      onConfirm: (name) => {
        if (!activeProject) return;
        const folderPath = parentPath ? `${parentPath}/${name}` : name;
        createFile(activeProject.id, `${folderPath}/.gitkeep`, "");
        setOpenFolders((p) => {
          const n = new Set(p);
          let acc = "";
          for (const part of folderPath.split("/")) { acc = acc ? `${acc}/${part}` : part; n.add(acc); }
          return n;
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      },
    });
  };

  // ── Exportar ZIP ───────────────────────────────────────────────────────────
  const exportZip = useCallback(async (folderPrefix?: string, zipName?: string) => {
    if (!activeProject) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const zip = new JSZip();
      const files = folderPrefix
        ? activeProject.files.filter((f) => (f.path || f.name).startsWith(folderPrefix + "/") || (f.path || f.name) === folderPrefix)
        : activeProject.files;
      if (files.length === 0) { Alert.alert("ZIP vazio", "Nenhum arquivo nesta pasta."); return; }
      for (const f of files) {
        const path = folderPrefix && (f.path || f.name).startsWith(folderPrefix + "/")
          ? (f.path || f.name).slice(folderPrefix.length + 1)
          : (f.path || f.name);
        zip.file(path, f.content || "");
      }
      const uint8 = await zip.generateAsync({ type: "uint8array" });
      const name = zipName || activeProject.name;
      const zipFile = new FSFile(Paths.cache, `${name}.zip`);
      zipFile.write(uint8);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(zipFile.uri, { mimeType: "application/zip", dialogTitle: `Exportar ${name}.zip` });
      } else {
        Alert.alert("ZIP salvo", `Arquivo salvo em:\n${zipFile.uri}`);
      }
    } catch (e: any) {
      Alert.alert("Erro ao criar ZIP", e.message || String(e));
    }
  }, [activeProject]);

  // ── Ações de contexto de arquivo ───────────────────────────────────────────
  const handleContextFile = (file: ProjectFile) => {
    // O ContextSheet já mostra as ações, aqui tratamos as ações que precisam de dados adicionais
    // via setContextFile para processar depois
    setContextFile(file);
  };

  // Processa ações quando contextFile + contextAction estão definidos
  // (as ações diretas como copiar caminho são tratadas inline no sheet)

  const handleOpenFile = useCallback((file: ProjectFile) => {
    setActiveFile(file);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose?.();
  }, [setActiveFile, onClose]);

  const handleDeleteFile = useCallback((file: ProjectFile) => {
    Alert.alert("Excluir arquivo", `Excluir "${file.name}"?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", style: "destructive", onPress: () => { deleteFile(activeProject!.id, file.id); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); } },
    ]);
  }, [activeProject, deleteFile]);

  const handleDuplicate = useCallback((file: ProjectFile) => {
    if (!activeProject) return;
    const ext = file.name.includes(".") ? "." + file.name.split(".").pop() : "";
    const base = file.name.includes(".") ? file.name.slice(0, file.name.lastIndexOf(".")) : file.name;
    const dir = (file.path || file.name).includes("/") ? (file.path || file.name).split("/").slice(0, -1).join("/") + "/" : "";
    const copyName = `${dir}${base}_copia${ext}`;
    const newFile = createFile(activeProject.id, copyName, file.content);
    setActiveFile(newFile);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [activeProject, createFile, setActiveFile]);

  if (!activeProject) {
    return (
      <View style={[styles.container, { backgroundColor: colors.card }]}>
        <View style={styles.empty}>
          <Feather name="folder" size={28} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Nenhum projeto aberto</Text>
        </View>
        {onMenuPress && (
          <TouchableOpacity
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onMenuPress(); }}
            style={[styles.menuBtn, { borderTopColor: colors.border }]}
          >
            <Feather name="menu" size={15} color={colors.primary} />
            <Text style={[styles.menuBtnText, { color: colors.primary }]}>Menu</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>

      {/* ── Cabeçalho ─────────────────────────────────────────────────────── */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={[styles.folderIconWrap, { backgroundColor: colors.primary + "22" }]}>
          <Feather name="folder" size={12} color={colors.primary} />
        </View>
        <Text style={[styles.projectName, { color: colors.foreground }]} numberOfLines={1}>
          {activeProject.name}
        </Text>
        {/* Botões de cabeçalho */}
        <TouchableOpacity
          onPress={() => startCreate("")}
          style={[styles.headerBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="file-plus" size={14} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => createFolderIn("")}
          style={[styles.headerBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="folder-plus" size={14} color="#f59e0b" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => exportZip()}
          style={[styles.headerBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="archive" size={14} color="#22c55e" />
        </TouchableOpacity>
      </View>

      {/* ── Memória do Projeto ─────────────────────────────────────────────── */}
      <TouchableOpacity
        onPress={() => { onMemoryPress?.(); }}
        style={[styles.memoryRow, { borderBottomColor: colors.border }]}
        activeOpacity={0.75}
      >
        <Text style={styles.memoryEmoji}>🧠</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.memoryLabel, { color: "#7c3aed" }]}>Memória do Projeto</Text>
          <Text style={[styles.memoryDesc, { color: colors.mutedForeground }]}>.jasmim-memory.json</Text>
        </View>
        <Feather name="chevron-right" size={12} color="#7c3aed66" />
      </TouchableOpacity>

      {/* ── Árvore de arquivos ────────────────────────────────────────────── */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: 4 }} keyboardShouldPersistTaps="handled">
        {tree.map((node) => (
          <TreeNodeRow
            key={node.fullPath}
            node={node}
            depth={0}
            activeFileId={activeFile?.id}
            openFolders={openFolders}
            toggleFolder={toggleFolder}
            onOpenFile={handleOpenFile}
            onCreateInFolder={(folderPath) => startCreate(folderPath)}
            onCreateFolderIn={createFolderIn}
            onExportFolderZip={(folderPath, name) => exportZip(folderPath, name)}
            onContextFile={(file) => {
              // O ContextSheet inline trata ações diretas
              // Para rename/delete/duplicate precisamos da ação
              setContextFile(file);
            }}
          />
        ))}

        {activeProject.files.filter(f => f.name !== ".gitkeep").length === 0 && !creating && (
          <View style={styles.noFiles}>
            <Feather name="file-text" size={24} color={colors.mutedForeground} style={{ opacity: 0.4 }} />
            <Text style={[styles.noFilesText, { color: colors.mutedForeground }]}>Nenhum arquivo</Text>
            <TouchableOpacity onPress={() => startCreate("")}>
              <Text style={[styles.createHint, { color: colors.primary }]}>+ Criar arquivo</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* ── Campo de criação de arquivo ───────────────────────────────────── */}
      {creating && (
        <View style={[styles.createRow, { borderTopColor: colors.border, backgroundColor: colors.card }]}>
          <TextInput
            ref={createInputRef}
            style={[styles.newFileInput, { color: colors.foreground, borderColor: colors.primary, backgroundColor: colors.background }]}
            value={newName}
            onChangeText={setNewName}
            placeholder="src/components/arquivo.ts"
            placeholderTextColor={colors.mutedForeground}
            onSubmitEditing={confirmCreate}
            onBlur={() => { if (!newName.trim()) setCreating(false); }}
            autoFocus
            autoCorrect={false}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={confirmCreate} style={styles.confirmBtn}>
            <Feather name="check" size={16} color="#22c55e" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setCreating(false); setNewName(""); }} style={styles.cancelBtn}>
            <Feather name="x" size={16} color="#ef4444" />
          </TouchableOpacity>
        </View>
      )}

      {/* ── Botão Menu ───────────────────────────────────────────────────── */}
      {onMenuPress && (
        <TouchableOpacity
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onMenuPress(); }}
          style={[styles.menuBtn, { borderTopColor: colors.border }]}
        >
          <Feather name="menu" size={15} color={colors.primary} />
          <Text style={[styles.menuBtnText, { color: colors.primary }]}>Menu</Text>
        </TouchableOpacity>
      )}

      {/* ── Prompt cross-platform ─────────────────────────────────────────── */}
      <PromptModal
        visible={!!prompt}
        title={prompt?.title || ""}
        subtitle={prompt?.subtitle}
        placeholder={prompt?.placeholder}
        initialValue={prompt?.initialValue}
        onConfirm={(v) => { prompt?.onConfirm(v); setPrompt(null); }}
        onCancel={() => setPrompt(null)}
      />

      {/* ── Context Sheet para ações de arquivo ───────────────────────────── */}
      {contextFile && (
        <ContextSheet
          title={contextFile.path || contextFile.name}
          icon={getFileStyle(contextFile.name).icon as never}
          iconColor={getFileStyle(contextFile.name).color}
          actions={[
            {
              icon: "folder", label: "Abrir", color: colors.primary,
              onPress: () => { handleOpenFile(contextFile); setContextFile(null); },
            },
            {
              icon: "edit-2", label: "Renomear", color: "#f59e0b",
              onPress: () => {
                const f = contextFile;
                setContextFile(null);
                if (!activeProject || !f) return;
                showPrompt({
                  title: "Renomear", subtitle: f.path || f.name,
                  placeholder: "novo-nome.ts", initialValue: f.name,
                  onConfirm: (newN) => { if (newN !== f.name) renameFile(activeProject.id, f.id, newN); },
                });
              },
            },
            {
              icon: "copy", label: "Duplicar", color: colors.foreground,
              onPress: () => { handleDuplicate(contextFile); setContextFile(null); },
            },
            ...(onAnalyzeWithAI ? [{
              icon: "cpu", label: "Analisar com IA", color: "#7c3aed",
              onPress: () => { onAnalyzeWithAI(contextFile); setContextFile(null); },
            }] : []),
            {
              icon: "clipboard", label: "Copiar Caminho", color: colors.foreground,
              onPress: () => { Clipboard.setStringAsync(contextFile.path || contextFile.name); setContextFile(null); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); },
            },
            {
              icon: "trash-2", label: "Excluir", color: "#ef4444",
              onPress: () => { handleDeleteFile(contextFile); setContextFile(null); },
            },
          ]}
          onClose={() => setContextFile(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: "hidden" },
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 10, paddingVertical: 8,
    borderBottomWidth: 1, gap: 5, minHeight: 46,
  },
  folderIconWrap: { width: 24, height: 24, borderRadius: 6, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  projectName: { flex: 1, fontSize: 11, fontWeight: "700", minWidth: 0 },
  headerBtn: { width: 28, height: 28, borderRadius: 7, borderWidth: 1, alignItems: "center", justifyContent: "center", flexShrink: 0 },

  memoryRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 9, borderBottomWidth: StyleSheet.hairlineWidth, gap: 8, backgroundColor: "#7c3aed0d" },
  memoryEmoji: { fontSize: 14 },
  memoryLabel: { fontSize: 11, fontWeight: "700" },
  memoryDesc: { fontSize: 10, marginTop: 1 },

  row: { flexDirection: "row", alignItems: "center", paddingRight: 6, paddingVertical: 8, gap: 5, minHeight: 36 },
  label: { fontSize: 12, fontWeight: "500" },
  activeDot: { width: 5, height: 5, borderRadius: 3 },
  moreBtn: { width: 26, height: 26, alignItems: "center", justifyContent: "center", borderRadius: 5, flexShrink: 0 },
  moreDot: { fontSize: 17, lineHeight: 19, fontWeight: "700" },

  noFiles: { padding: 20, alignItems: "center", gap: 10 },
  noFilesText: { fontSize: 12 },
  createHint: { fontSize: 13, fontWeight: "700" },

  createRow: { flexDirection: "row", alignItems: "center", padding: 8, borderTopWidth: 1, gap: 6 },
  newFileInput: { flex: 1, height: 36, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, fontSize: 13 },
  confirmBtn: { padding: 6 },
  cancelBtn: { padding: 6 },

  menuBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12, borderTopWidth: StyleSheet.hairlineWidth },
  menuBtnText: { fontSize: 13, fontWeight: "600" },

  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  emptyText: { fontSize: 12 },

  // Prompt modal
  promptOverlay: { flex: 1, backgroundColor: "#00000088", alignItems: "center", justifyContent: "center", padding: 24 },
  promptBox: { width: "100%", borderRadius: 16, borderWidth: 1, padding: 20, gap: 12 },
  promptTitle: { fontSize: 16, fontWeight: "700" },
  promptSub: { fontSize: 12, marginTop: -6 },
  promptInput: { height: 44, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, fontSize: 14 },
  promptActions: { flexDirection: "row", gap: 10, justifyContent: "flex-end", marginTop: 4 },
  promptBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  promptBtnText: { fontSize: 14, fontWeight: "600" },

  // Bottom sheet
  sheetOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "#00000066" },
  sheet: { position: "absolute", bottom: 0, left: 0, right: 0, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "75%", overflow: "hidden" },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#555", alignSelf: "center", marginTop: 10, marginBottom: 4 },
  sheetHeader: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  sheetTitle: { flex: 1, fontSize: 13, fontWeight: "700" },
  sheetAction: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  sheetActionText: { fontSize: 15, fontWeight: "500" },
});
