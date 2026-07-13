'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  BookOpen,
  Search,
  Leaf,
  Plus,
  Pencil,
  Trash2,
  X,
  Tag,
  GripVertical,
  ArrowUpDown,
  Eye,
  EyeOff,
  SlidersHorizontal,
  RefreshCw,
  Copy,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  XCircle,
  LayoutGrid,
  Package,
  Loader2,
} from 'lucide-react';
import { useURYStore } from '@/lib/ury-store';
import type { MenuItem, MenuCourse, MenuFormData, CourseFormData } from '@/lib/ury-types';

type SortField = 'name' | 'price' | 'availability';
type SortDirection = 'asc' | 'desc';

export function MenuManagementTab() {
  const {
    menuCourses,
    menuItems,
    currency,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleMenuItemAvailability,
    addMenuCourse,
    updateMenuCourse,
    deleteMenuCourse,
    loadMenuFromDB,
  } = useURYStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCourse, setActiveCourse] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [isLoading, setIsLoading] = useState(false);

  // Sorting state
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Menu Item Dialog state
  const [menuItemDialogOpen, setMenuItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [menuItemForm, setMenuItemForm] = useState<MenuFormData>({
    name: '',
    nameLocal: '',
    course: '',
    price: 0,
    description: '',
    isVeg: true,
    isAvailable: true,
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');

  // Form validation tracking
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  // Course Dialog state
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<MenuCourse | null>(null);
  const [courseForm, setCourseForm] = useState<CourseFormData>({
    name: '',
    priority: 0,
  });
  const [courseFormAttempted, setCourseFormAttempted] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'item' | 'course'; id: string; name: string } | null>(null);

  // ── Load data on mount ─────────────────────────────────
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await loadMenuFromDB();
      } catch {
        // Silently handle - store falls back to mock data
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [loadMenuFromDB]);

  // ── Sync from DB handler ───────────────────────────────
  const handleSyncFromDB = useCallback(async () => {
    setIsLoading(true);
    try {
      await loadMenuFromDB();
    } catch {
      // Silently handle
    } finally {
      setIsLoading(false);
    }
  }, [loadMenuFromDB]);

  // ── Sorting handler ────────────────────────────────────
  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField]);

  // ── Bulk availability toggle ───────────────────────────
  const handleBulkToggle = useCallback((courseId: string) => {
    const courseItems = menuItems.filter((i) => i.course === courseId);
    if (courseItems.length === 0) return;

    const allAvailable = courseItems.every((i) => i.isAvailable);
    // If all available → make all unavailable; otherwise → make all available
    courseItems.forEach((item) => {
      if (allAvailable && item.isAvailable) {
        toggleMenuItemAvailability(item.id);
      } else if (!allAvailable && !item.isAvailable) {
        toggleMenuItemAvailability(item.id);
      }
    });
  }, [menuItems, toggleMenuItemAvailability]);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let items = [...menuItems];

    // Filter by course
    if (activeCourse !== 'all') {
      items = items.filter((item) => item.course === activeCourse);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.courseName.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sort
    items.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'name':
          cmp = a.name.localeCompare(b.name);
          break;
        case 'price':
          cmp = a.price - b.price;
          break;
        case 'availability':
          cmp = Number(b.isAvailable) - Number(a.isAvailable);
          break;
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });

    return items;
  }, [menuItems, activeCourse, searchQuery, sortField, sortDirection]);

  // ── Statistics ─────────────────────────────────────────
  const totalItems = menuItems.length;
  const availableItems = menuItems.filter((i) => i.isAvailable).length;
  const unavailableItems = totalItems - availableItems;
  const totalCategories = menuCourses.length;

  // ── Menu Item CRUD handlers ─────────────────────────────

  const openCreateItemDialog = () => {
    setEditingItem(null);
    setMenuItemForm({
      name: '',
      nameLocal: '',
      course: menuCourses[0]?.id || '',
      price: 0,
      description: '',
      isVeg: true,
      isAvailable: true,
      tags: [],
    });
    setTagInput('');
    setAttemptedSubmit(false);
    setMenuItemDialogOpen(true);
  };

  const openEditItemDialog = (item: MenuItem) => {
    setEditingItem(item);
    setMenuItemForm({
      name: item.name,
      nameLocal: item.nameHi || '',
      course: item.course,
      price: item.price,
      description: item.description || '',
      isVeg: item.isVeg,
      isAvailable: item.isAvailable,
      tags: item.tags || [],
    });
    setTagInput('');
    setAttemptedSubmit(false);
    setMenuItemDialogOpen(true);
  };

  const handleDuplicateItem = (item: MenuItem) => {
    const duplicatedForm: MenuFormData = {
      name: `${item.name} (kopija)`,
      nameLocal: item.nameHi || '',
      course: item.course,
      price: item.price,
      description: item.description || '',
      isVeg: item.isVeg,
      isAvailable: item.isAvailable,
      tags: item.tags ? [...item.tags] : [],
    };
    addMenuItem(duplicatedForm);
  };

  const handleSaveMenuItem = () => {
    setAttemptedSubmit(true);
    if (!menuItemForm.name.trim() || menuItemForm.price <= 0 || !menuItemForm.course) return;
    if (editingItem) {
      updateMenuItem(editingItem.id, menuItemForm);
    } else {
      addMenuItem(menuItemForm);
    }
    setMenuItemDialogOpen(false);
    setAttemptedSubmit(false);
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !menuItemForm.tags?.includes(tag)) {
      setMenuItemForm((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), tag],
      }));
    }
    setTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    setMenuItemForm((prev) => ({
      ...prev,
      tags: prev.tags?.filter((t) => t !== tag) || [],
    }));
  };

  // ── Course CRUD handlers ────────────────────────────────

  const openCreateCourseDialog = () => {
    setEditingCourse(null);
    setCourseForm({
      name: '',
      priority: menuCourses.length + 1,
    });
    setCourseFormAttempted(false);
    setCourseDialogOpen(true);
  };

  const openEditCourseDialog = (course: MenuCourse) => {
    setEditingCourse(course);
    setCourseForm({
      name: course.name,
      priority: course.priority,
    });
    setCourseFormAttempted(false);
    setCourseDialogOpen(true);
  };

  const handleSaveCourse = () => {
    setCourseFormAttempted(true);
    if (!courseForm.name.trim()) return;
    if (editingCourse) {
      updateMenuCourse(editingCourse.id, courseForm);
    } else {
      addMenuCourse(courseForm);
    }
    setCourseDialogOpen(false);
  };

  // ── Validation helpers ─────────────────────────────────
  const isNameInvalid = attemptedSubmit && !menuItemForm.name.trim();
  const isPriceInvalid = attemptedSubmit && menuItemForm.price <= 0;
  const isCourseInvalid = attemptedSubmit && !menuItemForm.course;
  const isCourseNameInvalid = courseFormAttempted && !courseForm.name.trim();

  // ── Sort icon helper ───────────────────────────────────
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-40" />;
    return sortDirection === 'asc' ? <ArrowUp className="h-3 w-3 ml-1" /> : <ArrowDown className="h-3 w-3 ml-1" />;
  };

  return (
    <TooltipProvider>
      <div className="space-y-5">
        {/* ── Gradient Header Card ───────────────────────── */}
        <Card className="overflow-hidden border-0 shadow-lg">
          <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 p-6 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Upravljanje jedilnika</h2>
                <p className="text-emerald-100 text-sm mt-1">Upravljajte artikle, kategorije in razpoložljivost</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm self-start sm:self-auto"
                onClick={handleSyncFromDB}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Sinhroniziraj iz PB
              </Button>
            </div>
          </div>
          {/* Statistics Summary */}
          <CardContent className="p-0">
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 border-t border-border">
              <div className="p-4 flex items-center gap-3">
                <div className="rounded-lg bg-emerald-100 p-2">
                  <Package className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Skupaj artiklov</p>
                  <p className="text-2xl font-bold">{totalItems}</p>
                </div>
              </div>
              <div className="p-4 flex items-center gap-3">
                <div className="rounded-lg bg-green-100 p-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Na voljo</p>
                  <p className="text-2xl font-bold text-green-700">{availableItems}</p>
                </div>
              </div>
              <div className="p-4 flex items-center gap-3">
                <div className="rounded-lg bg-red-100 p-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Ni na voljo</p>
                  <p className="text-2xl font-bold text-red-600">{unavailableItems}</p>
                </div>
              </div>
              <div className="p-4 flex items-center gap-3">
                <div className="rounded-lg bg-amber-100 p-2">
                  <LayoutGrid className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Kategorije</p>
                  <p className="text-2xl font-bold text-amber-700">{totalCategories}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Action Bar ─────────────────────────────────── */}
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Išči artikle, kategorije, oznake..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
                {searchQuery && (
                  <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setSearchQuery('')}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={openCreateItemDialog}>
                <Plus className="h-4 w-4 mr-1" />
                Nov artikel
              </Button>
              <Button variant="outline" size="sm" onClick={openCreateCourseDialog}>
                <Plus className="h-4 w-4 mr-1" />
                Nova kategorija
              </Button>
              <div className="flex items-center gap-1 border rounded-md p-0.5">
                <Button variant={viewMode === 'table' ? 'default' : 'ghost'} size="sm" className="h-7 px-2" onClick={() => setViewMode('table')}>
                  <ArrowUpDown className="h-3.5 w-3.5" />
                </Button>
                <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="sm" className="h-7 px-2" onClick={() => setViewMode('grid')}>
                  <GripVertical className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Sorting Options */}
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t">
              <span className="text-xs text-muted-foreground font-medium">Razvrsti:</span>
              <Button
                variant={sortField === 'name' ? 'default' : 'outline'}
                size="sm"
                className={`h-7 text-xs ${sortField === 'name' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                onClick={() => handleSort('name')}
              >
                Ime <SortIcon field="name" />
              </Button>
              <Button
                variant={sortField === 'price' ? 'default' : 'outline'}
                size="sm"
                className={`h-7 text-xs ${sortField === 'price' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                onClick={() => handleSort('price')}
              >
                Cena <SortIcon field="price" />
              </Button>
              <Button
                variant={sortField === 'availability' ? 'default' : 'outline'}
                size="sm"
                className={`h-7 text-xs ${sortField === 'availability' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                onClick={() => handleSort('availability')}
              >
                Razpoložljivost <SortIcon field="availability" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ── Course Filters with Bulk Toggle ────────────── */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeCourse === 'all' ? 'default' : 'outline'}
            size="sm"
            className={activeCourse === 'all' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
            onClick={() => setActiveCourse('all')}
          >
            Vse ({menuItems.length})
          </Button>
          {menuCourses.map((course) => {
            const count = menuItems.filter((i) => i.course === course.id).length;
            const courseItems = menuItems.filter((i) => i.course === course.id);
            const allAvailable = courseItems.length > 0 && courseItems.every((i) => i.isAvailable);
            const noneAvailable = courseItems.length > 0 && courseItems.every((i) => !i.isAvailable);
            return (
              <div key={course.id} className="flex items-center gap-1">
                <Button
                  variant={activeCourse === course.id ? 'default' : 'outline'}
                  size="sm"
                  className={activeCourse === course.id ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                  onClick={() => setActiveCourse(course.id)}
                >
                  {course.name} ({count})
                </Button>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleBulkToggle(course.id)}
                      disabled={count === 0}
                    >
                      {allAvailable ? (
                        <EyeOff className="h-3.5 w-3.5 text-amber-500" />
                      ) : noneAvailable ? (
                        <Eye className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {allAvailable
                        ? 'Onemogoči vse v kategoriji'
                        : 'Omogoči vse v kategoriji'}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            );
          })}
        </div>

        {/* ── Course Management Section ───────────────────── */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2 bg-gradient-to-r from-muted/80 to-muted/40 rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Kategorije jedilnika</CardTitle>
              <Badge variant="secondary" className="text-xs">{menuCourses.length} kategorij</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {menuCourses.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Ni še dodanih kategorij</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {menuCourses.map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-muted/50 text-sm hover:bg-muted transition-colors"
                  >
                    <span className="text-muted-foreground text-xs font-mono">#{course.priority}</span>
                    <span className="font-medium">{course.name}</span>
                    <Badge variant="outline" className="text-[10px] h-4 px-1">{course.itemCount} artiklov</Badge>
                    <Separator orientation="vertical" className="h-4" />
                    <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => openEditCourseDialog(course)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-5 w-5 text-red-500 hover:text-red-700" onClick={() => setDeleteTarget({ type: 'course', id: course.id, name: course.name })}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Results count ───────────────────────────────── */}
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Prikazano {filteredItems.length} od {menuItems.length} artiklov
          {searchQuery && ` za "${searchQuery}"`}
        </div>

        {/* ── Items Display ───────────────────────────────── */}
        {viewMode === 'table' ? (
          <Card className="shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-10">Veg</TableHead>
                      <TableHead
                        className="cursor-pointer select-none hover:bg-muted transition-colors"
                        onClick={() => handleSort('name')}
                      >
                        <span className="flex items-center">Ime <SortIcon field="name" /></span>
                      </TableHead>
                      <TableHead>Kategorija</TableHead>
                      <TableHead
                        className="text-right cursor-pointer select-none hover:bg-muted transition-colors"
                        onClick={() => handleSort('price')}
                      >
                        <span className="flex items-center justify-end">Cena <SortIcon field="price" /></span>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer select-none hover:bg-muted transition-colors"
                        onClick={() => handleSort('availability')}
                      >
                        <span className="flex items-center">Status <SortIcon field="availability" /></span>
                      </TableHead>
                      <TableHead>Oznake</TableHead>
                      <TableHead className="text-right">Dejanja</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => (
                      <TableRow key={item.id} className={!item.isAvailable ? 'opacity-50' : ''}>
                        <TableCell>
                          <span className={`inline-block w-3.5 h-3.5 rounded-sm border-2 ${
                            item.isVeg ? 'bg-green-500 border-green-600' : 'bg-red-500 border-red-600'
                          }`} />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{item.name}</p>
                            {item.nameHi && <p className="text-xs text-muted-foreground">{item.nameHi}</p>}
                            {item.description && <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{item.description}</p>}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{item.courseName}</TableCell>
                        <TableCell className="text-right font-mono font-semibold text-emerald-600">
                          {currency}{item.price.toLocaleString('sl-SI')}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${
                              item.isAvailable
                                ? 'border-emerald-300 text-emerald-700 bg-emerald-50'
                                : 'border-red-300 text-red-700 bg-red-50'
                            }`}
                          >
                            {item.isAvailable ? 'Na voljo' : 'Ni na voljo'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {item.tags?.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-0.5">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => toggleMenuItemAvailability(item.id)}
                                >
                                  {item.isAvailable ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5 text-red-500" />}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>{item.isAvailable ? 'Onemogoči' : 'Omogoči'}</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDuplicateItem(item)}>
                                  <Copy className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Dupliciraj artikel</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditItemDialog(item)}>
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Uredi</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-red-500 hover:text-red-700"
                                  onClick={() => setDeleteTarget({ type: 'item', id: item.id, name: item.name })}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Izbriši</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredItems.map((item) => (
              <Card key={item.id} className={`transition-all hover:shadow-md border ${!item.isAvailable ? 'opacity-60' : ''}`}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`w-3.5 h-3.5 rounded-sm border-2 shrink-0 ${
                          item.isVeg ? 'bg-green-500 border-green-600' : 'bg-red-500 border-red-600'
                        }`} />
                        <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.courseName}</p>
                    </div>
                    <span className="text-base font-bold text-emerald-600 shrink-0">
                      {currency}{item.price.toLocaleString('sl-SI')}
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                  )}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0 h-4">{tag}</Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-1">
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        item.isAvailable ? 'border-emerald-300 text-emerald-700 bg-emerald-50' : 'border-red-300 text-red-700 bg-red-50'
                      }`}
                    >
                      {item.isAvailable ? 'Na voljo' : 'Ni na voljo'}
                    </Badge>
                    <div className="flex items-center gap-0.5">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleMenuItemAvailability(item.id)}>
                            {item.isAvailable ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3 text-red-500" />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{item.isAvailable ? 'Onemogoči' : 'Omogoči'}</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDuplicateItem(item)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Dupliciraj</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEditItemDialog(item)}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Uredi</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => setDeleteTarget({ type: 'item', id: item.id, name: item.name })}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Izbriši</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredItems.length === 0 && !isLoading && (
          <div className="py-12 text-center text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Ni zadetkov</p>
            <p className="text-sm mt-1">Poskusite spremeniti iskalni niz ali filtre</p>
          </div>
        )}

        {/* ── Menu Item Dialog ──────────────────────────────── */}
        <Dialog open={menuItemDialogOpen} onOpenChange={(open) => { setMenuItemDialogOpen(open); if (!open) setAttemptedSubmit(false); }}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {editingItem ? <Pencil className="h-5 w-5 text-emerald-600" /> : <Plus className="h-5 w-5 text-emerald-600" />}
                {editingItem ? 'Uredi artikel' : 'Nov artikel'}
              </DialogTitle>
              <DialogDescription>
                {editingItem ? 'Posodobite podatke artikla v jedilniku.' : 'Dodajte nov artikel v jedilnik.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="item-name" className={isNameInvalid ? 'text-red-500' : ''}>
                    Ime artikla *
                  </Label>
                  <Input
                    id="item-name"
                    placeholder="npr. Butter Chicken"
                    value={menuItemForm.name}
                    onChange={(e) => setMenuItemForm((prev) => ({ ...prev, name: e.target.value }))}
                    className={isNameInvalid ? 'border-red-500 focus-visible:ring-red-500' : ''}
                  />
                  {isNameInvalid && (
                    <p className="text-xs text-red-500">Ime artikla je obvezno</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="item-name-local">Lokalno ime</Label>
                  <Input
                    id="item-name-local"
                    placeholder="npr. बटर चिकन"
                    value={menuItemForm.nameLocal || ''}
                    onChange={(e) => setMenuItemForm((prev) => ({ ...prev, nameLocal: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="item-course" className={isCourseInvalid ? 'text-red-500' : ''}>
                    Kategorija *
                  </Label>
                  <Select
                    value={menuItemForm.course}
                    onValueChange={(value) => setMenuItemForm((prev) => ({ ...prev, course: value }))}
                  >
                    <SelectTrigger id="item-course" className={isCourseInvalid ? 'border-red-500 focus:ring-red-500' : ''}>
                      <SelectValue placeholder="Izberite kategorijo" />
                    </SelectTrigger>
                    <SelectContent>
                      {menuCourses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isCourseInvalid && (
                    <p className="text-xs text-red-500">Izberite kategorijo</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="item-price" className={isPriceInvalid ? 'text-red-500' : ''}>
                    Cena ({currency}) *
                  </Label>
                  <Input
                    id="item-price"
                    type="number"
                    min={0}
                    value={menuItemForm.price || ''}
                    onChange={(e) => setMenuItemForm((prev) => ({ ...prev, price: Number(e.target.value) }))}
                    className={isPriceInvalid ? 'border-red-500 focus-visible:ring-red-500' : ''}
                  />
                  {isPriceInvalid && (
                    <p className="text-xs text-red-500">Cena mora biti večja od 0</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="item-description">Opis</Label>
                <Textarea
                  id="item-description"
                  placeholder="Kratek opis artikla..."
                  value={menuItemForm.description || ''}
                  onChange={(e) => setMenuItemForm((prev) => ({ ...prev, description: e.target.value }))}
                  rows={2}
                />
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    id="item-veg"
                    checked={menuItemForm.isVeg}
                    onCheckedChange={(checked) => setMenuItemForm((prev) => ({ ...prev, isVeg: checked }))}
                  />
                  <Label htmlFor="item-veg" className="flex items-center gap-1 cursor-pointer">
                    <Leaf className="h-3.5 w-3.5 text-green-500" />
                    Vegetarijansko
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="item-available"
                    checked={menuItemForm.isAvailable}
                    onCheckedChange={(checked) => setMenuItemForm((prev) => ({ ...prev, isAvailable: checked }))}
                  />
                  <Label htmlFor="item-available" className="cursor-pointer">Na voljo</Label>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Oznake</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="npr. bestseller"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={handleAddTag}>
                    Dodaj
                  </Button>
                </div>
                {menuItemForm.tags && menuItemForm.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {menuItemForm.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs pr-1">
                        {tag}
                        <button
                          className="ml-1 hover:text-red-500"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setMenuItemDialogOpen(false); setAttemptedSubmit(false); }}>
                Prekliči
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={handleSaveMenuItem}
              >
                {editingItem ? 'Shrani spremembe' : 'Dodaj artikel'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Course Dialog ─────────────────────────────────── */}
        <Dialog open={courseDialogOpen} onOpenChange={(open) => { setCourseDialogOpen(open); if (!open) setCourseFormAttempted(false); }}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-emerald-600" />
                {editingCourse ? 'Uredi kategorijo' : 'Nova kategorija'}
              </DialogTitle>
              <DialogDescription>
                {editingCourse ? 'Posodobite podatke kategorije.' : 'Dodajte novo kategorijo v jedilnik.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="course-name" className={isCourseNameInvalid ? 'text-red-500' : ''}>
                  Ime kategorije *
                </Label>
                <Input
                  id="course-name"
                  placeholder="npr. Predjedi"
                  value={courseForm.name}
                  onChange={(e) => setCourseForm((prev) => ({ ...prev, name: e.target.value }))}
                  className={isCourseNameInvalid ? 'border-red-500 focus-visible:ring-red-500' : ''}
                />
                {isCourseNameInvalid && (
                  <p className="text-xs text-red-500">Ime kategorije je obvezno</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="course-priority">Prioriteta (vrstni red)</Label>
                <Input
                  id="course-priority"
                  type="number"
                  min={0}
                  value={courseForm.priority || ''}
                  onChange={(e) => setCourseForm((prev) => ({ ...prev, priority: Number(e.target.value) }))}
                />
                <p className="text-xs text-muted-foreground">Nižja številka = višje v jedilniku</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setCourseDialogOpen(false); setCourseFormAttempted(false); }}>
                Prekliči
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={handleSaveCourse}
              >
                {editingCourse ? 'Shrani spremembe' : 'Dodaj kategorijo'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Delete Confirmation ───────────────────────────── */}
        <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Potrditev brisanja</AlertDialogTitle>
              <AlertDialogDescription>
                Ali ste prepričani, da želite izbrisati {deleteTarget?.type === 'item' ? 'artikel' : 'kategorijo'} &quot;{deleteTarget?.name}&quot;?
                {deleteTarget?.type === 'course' && ' Izbrišete lahko samo prazne kategorije.'}
                {' '}Tega dejanja ni mogoče razveljaviti.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteTarget(null)}>Prekliči</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700"
                onClick={() => {
                  if (deleteTarget) {
                    if (deleteTarget.type === 'item') {
                      deleteMenuItem(deleteTarget.id);
                    } else {
                      deleteMenuCourse(deleteTarget.id);
                    }
                  }
                  setDeleteTarget(null);
                }}
              >
                Izbriši
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
