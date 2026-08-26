import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      await registerUser(values);
      toast.success('Account created — $100,000 in virtual cash is waiting for you');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="h-10 w-10 mx-auto rounded-xl bg-accent flex items-center justify-center font-display font-bold text-white mb-3">
            L
          </div>
          <h1 className="font-display text-2xl font-semibold">Create your account</h1>
          <p className="text-mist text-sm mt-1">Start with $100,000 in virtual cash.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4">
          <div>
            <label className="label-eyebrow block mb-1.5">Name</label>
            <input
              type="text"
              className="input-field"
              placeholder="Jane Doe"
              {...register('name', { required: true })}
            />
            {errors.name && <p className="text-loss text-xs mt-1">Name is required</p>}
          </div>

          <div>
            <label className="label-eyebrow block mb-1.5">Email</label>
            <input
              type="email"
              className="input-field"
              placeholder="you@example.com"
              {...register('email', { required: true })}
            />
            {errors.email && <p className="text-loss text-xs mt-1">Email is required</p>}
          </div>

          <div>
            <label className="label-eyebrow block mb-1.5">Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="At least 6 characters"
              {...register('password', { required: true, minLength: 6 })}
            />
            {errors.password && (
              <p className="text-loss text-xs mt-1">Password must be at least 6 characters</p>
            )}
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-mist mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
