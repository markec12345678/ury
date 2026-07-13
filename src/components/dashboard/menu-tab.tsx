'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  BookOpen,
  Search,
  Leaf,
  Drumstick,
  X,
  SlidersHorizontal,
  Tag,
} from 'lucide-react';
import { useURYStore } from '@/lib/ury-store';
import type { MenuItem, MenuCourse } from '@/lib/ury-types';

export function MenuTab() {
  const { menuCourses, menuItems, currency, isConnected } = useURYStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCourse, setActiveCourse] = useState<string>('all');
  const [vegOnly, setVegOnly] = useState(false);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  const filteredItems = useMemo(() => {
    let items = menuItems;

    // Filter by course
    if (activeCourse !== 'all') {
      items = items.filter((item) => item.course === activeCourse);
    }

    // Filter by veg
    if (vegOnly) {
      items = items.filter((item) => item.isVeg);
    }

    // Filter by availability
    if (showAvailableOnly) {
      items = items.filter((item) => item.isAvailable);
    }

    // Search
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

    return items;
  }, [menuItems, activeCourse, vegOnly, showAvailableOnly, searchQuery]);

  const totalItems = menuItems.length;
  const availableItems = menuItems.filter((i) => i.isAvailable).length;
  const vegItems = menuItems.filter((i) => i.isVeg).length;
  const avgPrice = totalItems > 0
    ? Math.round(menuItems.reduce((sum, i) => sum + i.price, 0) / totalItems)
    : 0;

  return (
    <div className="space-y-4">
      {/* Header Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="p-3 flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-xs text-emerald-600 font-medium">Skupaj artiklov</p>
              <p className="text-xl font-bold text-emerald-800">{totalItems}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-3 flex items-center gap-3">
            <Leaf className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-xs text-green-600 font-medium">Vegetarijansko</p>
              <p className="text-xl font-bold text-green-800">{vegItems}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-3 flex items-center gap-3">
            <Tag className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-xs text-blue-600 font-medium">Dosegljivo</p>
              <p className="text-xl font-bold text-blue-800">{availableItems}/{totalItems}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-3 flex items-center gap-3">
            <SlidersHorizontal className="h-5 w-5 text-amber-600" />
            <div>
              <p className="text-xs text-amber-600 font-medium">Povprečna cena</p>
              <p className="text-xl font-bold text-amber-800">{currency}{avgPrice}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Išči artikle, krožnike, oznake..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
        <Button
          variant={vegOnly ? 'default' : 'outline'}
          size="sm"
          className={vegOnly ? 'bg-green-600 hover:bg-green-700' : ''}
          onClick={() => setVegOnly(!vegOnly)}
        >
          <Leaf className="h-3.5 w-3.5 mr-1" />
          Veg
        </Button>
        <Button
          variant={showAvailableOnly ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowAvailableOnly(!showAvailableOnly)}
        >
          Dosegljivo
        </Button>
      </div>

      {/* Course Filters */}
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
          return (
            <Button
              key={course.id}
              variant={activeCourse === course.id ? 'default' : 'outline'}
              size="sm"
              className={activeCourse === course.id ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              onClick={() => setActiveCourse(course.id)}
            >
              {course.name} ({count})
            </Button>
          );
        })}
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Prikazano {filteredItems.length} od {menuItems.length} artiklov
        {searchQuery && ` za "${searchQuery}"`}
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filteredItems.map((item) => (
          <MenuCard key={item.id} item={item} currency={currency} />
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Ni zadetkov</p>
          <p className="text-sm">Poskusite spremeniti iskalni niz ali filtre</p>
        </div>
      )}
    </div>
  );
}

function MenuCard({ item, currency }: { item: MenuItem; currency: string }) {
  return (
    <Card
      className={`transition-all hover:shadow-md ${
        !item.isAvailable ? 'opacity-60' : ''
      }`}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-sm border shrink-0 ${
                item.isVeg
                  ? 'bg-green-500 border-green-600'
                  : 'bg-red-500 border-red-600'
              }`} title={item.isVeg ? 'Vegetarijansko' : 'Ne-vegetarijansko'} />
              <h3 className="font-semibold text-sm truncate">{item.name}</h3>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{item.courseName}</p>
          </div>
          <span className="text-base font-bold text-emerald-600 shrink-0">
            {currency}{item.price.toLocaleString('sl-SI')}
          </span>
        </div>

        {/* Description */}
        {item.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {item.description}
          </p>
        )}

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className={`text-[10px] px-1.5 py-0 h-4 ${
                  tag === 'bestseller'
                    ? 'border-amber-300 text-amber-700 bg-amber-50'
                    : tag === 'popular'
                    ? 'border-blue-300 text-blue-700 bg-blue-50'
                    : tag === 'chef-special'
                    ? 'border-purple-300 text-purple-700 bg-purple-50'
                    : tag === 'premium'
                    ? 'border-amber-400 text-amber-800 bg-amber-100'
                    : tag === 'bar'
                    ? 'border-violet-300 text-violet-700 bg-violet-50'
                    : 'border-gray-300 text-gray-600'
                }`}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Modifiers */}
        {item.modifiers && item.modifiers.length > 0 && (
          <div className="space-y-1">
            {item.modifiers.map((mod) => (
              <div key={mod.name} className="text-[10px] text-muted-foreground">
                <span className="font-medium">{mod.name}{mod.required ? ' *' : ''}:</span>{' '}
                {mod.options.join(', ')}
              </div>
            ))}
          </div>
        )}

        {/* Availability */}
        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className={`text-[10px] ${
              item.isAvailable
                ? 'border-emerald-300 text-emerald-700'
                : 'border-red-300 text-red-700 bg-red-50'
            }`}
          >
            {item.isAvailable ? 'Na voljo' : 'Ni na voljo'}
          </Badge>
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            {item.isVeg ? <Leaf className="h-3 w-3 text-green-500" /> : <Drumstick className="h-3 w-3 text-red-400" />}
            {item.isVeg ? 'Veg' : 'Non-Veg'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
