import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { userAPI } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { motion } from "framer-motion"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import { User, Save, Trash2, Mail, Calendar } from "lucide-react"
import toast from "react-hot-toast"
import { getInitials } from "@/lib/utils"
import { formatDate } from "@/lib/utils"
import BackButton from "@/components/ui/BackButton"

export default function Profile() {
  const { user, updateUser } = useAuth()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    preferences: {
      exercise: user?.preferences?.exercise || false,
      music: user?.preferences?.music || false,
      meditation: user?.preferences?.meditation || false,
    },
  })

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => userAPI.getProfile(),
    enabled: !!user,
  })

  const profile = profileData?.data?.user || user

  const updateMutation = useMutation({
    mutationFn: (data) => userAPI.updateProfile(data),
    onSuccess: (response) => {
      updateUser(response.data.user)
      queryClient.invalidateQueries({ queryKey: ["userProfile"] })
      setIsEditing(false)
      toast.success("Profile updated successfully!")
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update profile")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => userAPI.deleteProfile(),
    onSuccess: () => {
      toast.success("Account deleted successfully")
      window.location.href = "/login"
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete account")
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    updateMutation.mutate(formData)
  }

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      deleteMutation.mutate()
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <div className="flex flex-wrap items-center gap-3">
          <BackButton />
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <User className="h-8 w-8 text-primary" />
            Profile
          </h1>
        </div>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Info */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  {getInitials(profile?.firstName, profile?.lastName)}
                </div>
              </div>
              <div className="text-center space-y-1">
                <p className="font-semibold text-lg">
                  {profile?.firstName} {profile?.lastName}
                </p>
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <Mail className="h-3 w-3" />
                  {profile?.email}
                </p>
                {profile?.createdAt && (
                  <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Joined {formatDate(profile.createdAt)}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Profile Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal details and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      disabled={!isEditing || updateMutation.isPending}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      disabled={!isEditing || updateMutation.isPending}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={profile?.email || ""} disabled />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed
                  </p>
                </div>

                <div className="space-y-4">
                  <Label>Preferences</Label>
                  <div className="space-y-3">
                    {["exercise", "music", "meditation"].map((pref) => (
                      <div key={pref} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={pref}
                          checked={formData.preferences[pref]}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              preferences: {
                                ...formData.preferences,
                                [pref]: e.target.checked,
                              },
                            })
                          }
                          disabled={!isEditing || updateMutation.isPending}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <Label
                          htmlFor={pref}
                          className="cursor-pointer capitalize font-normal"
                        >
                          {pref}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button
                        type="submit"
                        disabled={updateMutation.isPending}
                      >
                        {updateMutation.isPending ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false)
                          setFormData({
                            firstName: profile?.firstName || "",
                            lastName: profile?.lastName || "",
                            preferences: {
                              exercise: profile?.preferences?.exercise || false,
                              music: profile?.preferences?.music || false,
                              meditation: profile?.preferences?.meditation || false,
                            },
                          })
                        }}
                        disabled={updateMutation.isPending}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Profile
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="mt-6 border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Account
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

