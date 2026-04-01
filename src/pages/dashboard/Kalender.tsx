import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar as CalendarIcon, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { supabase } from '@/lib/supabase'
import { useChurch } from '@/hooks/useChurch'
import type { PrayerEvent } from '@/lib/types'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from 'date-fns'
import { nl } from 'date-fns/locale'

export function KalenderPage() {
  const { church } = useChurch()
  const [events, setEvents] = useState<PrayerEvent[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newEventTitle, setNewEventTitle] = useState('')
  const [newEventDate, setNewEventDate] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!church) return
    fetchEvents()
  }, [church, currentMonth])

  const fetchEvents = async () => {
    if (!church) return
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    const { data } = await supabase
      .from('prayer_events')
      .select('*')
      .eq('church_id', church.id)
      .gte('event_date', format(start, 'yyyy-MM-dd'))
      .lte('event_date', format(end, 'yyyy-MM-dd'))
    setEvents(data ?? [])
  }

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!church || !newEventTitle.trim() || !newEventDate) return
    setLoading(true)

    await supabase.from('prayer_events').insert({
      church_id: church.id,
      title: newEventTitle.trim(),
      event_date: newEventDate,
    })

    setNewEventTitle('')
    setNewEventDate('')
    setShowAddDialog(false)
    setLoading(false)
    fetchEvents()
  }

  const handleDeleteEvent = async (id: string) => {
    await supabase.from('prayer_events').delete().eq('id', id)
    fetchEvents()
  }

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  })

  const getEventsForDay = (day: Date) =>
    events.filter((e) => isSameDay(new Date(e.event_date + 'T00:00:00'), day))

  const monthName = format(currentMonth, 'MMMM yyyy', { locale: nl })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gebedsmuur kalender</h1>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Evenement toevoegen
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="capitalize">{monthName}</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'].map((d) => (
              <div key={d} className="text-center text-xs font-medium text-gray-400 py-2">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for first week */}
            {Array.from({ length: (days[0].getDay() === 0 ? 6 : days[0].getDay() - 1) }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {days.map((day) => {
              const dayEvents = getEventsForDay(day)
              const today = isToday(day)
              return (
                <motion.div
                  key={day.toISOString()}
                  className={`min-h-[60px] p-1 rounded-xl border transition-colors ${
                    today ? 'border-primary bg-purple-50' : 'border-transparent hover:bg-gray-50'
                  }`}
                >
                  <div className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                    today ? 'bg-primary text-white' : 'text-gray-700'
                  }`}>
                    {format(day, 'd')}
                  </div>
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      className="text-xs bg-primary text-white rounded px-1 py-0.5 mb-0.5 flex items-center justify-between gap-1 group"
                    >
                      <span className="truncate">{event.title}</span>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="opacity-0 group-hover:opacity-100 shrink-0"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  ))}
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming events list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Aankomende evenementen
          </CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-6">Geen evenementen deze maand</p>
          ) : (
            <div className="space-y-2">
              {events
                .sort((a, b) => a.event_date.localeCompare(b.event_date))
                .map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                    <div>
                      <p className="font-medium text-sm text-gray-900">{event.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {format(new Date(event.event_date + 'T00:00:00'), 'EEEE d MMMM', { locale: nl })}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteEvent(event.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Evenement toevoegen</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddEvent} className="space-y-4 mt-2">
            <Input
              label="Titel"
              placeholder="Gebedsmuur bijeenkomst"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              required
            />
            <Input
              type="date"
              label="Datum"
              value={newEventDate}
              onChange={(e) => setNewEventDate(e.target.value)}
              required
            />
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                Annuleren
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Opslaan...' : 'Toevoegen'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
