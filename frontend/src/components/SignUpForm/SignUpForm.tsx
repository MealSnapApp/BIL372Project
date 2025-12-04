import { Form, Input, DatePicker, Select } from "antd";
import '../../styles.css'
import useSignUpForm from "./SignUpForm.logic";
import dayjs from 'dayjs';

interface SignUpFormProps {
  whichState: string;
  clear?: boolean;
}

const SignUpForm: React.FC<SignUpFormProps> = ({whichState, clear}) => {

  const {contextHolder,form,handleSubmit} = useSignUpForm(clear ?? false);

  const disabledDate = (current: any) => {
    // Can not select days after today - 7 years OR before 1900
    return current && (
      current > dayjs().subtract(7, 'year').endOf('day') ||
      current < dayjs('1900-01-01')
    );
  };

  return (
    <div className={`form-container sign-up-container${whichState === "signIn" ? " move-right" : ""}`}>
      
        {contextHolder}
        <div >
          <Form
            form={form}>
              <h2>Sign Up</h2>

              {/* Name Input */}
              <Form.Item
                name='Name'               
                rules={[{ required: true, message: 'Please enter your name!'}]}
              >
                <Input className="input" autoComplete="on" type="text" placeholder='Name'/>
              </Form.Item>

               {/* Surname Input */}
              <Form.Item
                name='Surname'
                rules={[{ required: true, message: 'Please enter your surname!'}]}
              >
                <Input className="input" autoComplete="on" type="text" placeholder='Surname'/>
              </Form.Item>

              <Form.Item
                name='Username'
                rules={[{ required: true, message: 'Please enter an username!'}]}
              >
                <Input className="input" autoComplete="off" type="text" placeholder='Username'/>
              </Form.Item>

              {/* Email Input */}
              <Form.Item
                name="Email"
                rules={[
                  {
                    type: 'email',
                    message: 'The input is not a valid email!',
                  },
                  {
                    required: true,
                    message: 'Please enter your email!',
                  },
                ]}
              >
                <Input className="input" autoComplete="on" placeholder='Email'/>
              </Form.Item>

              {/* Password Input */}
              <Form.Item
                name='Password'
                rules={[{ required: true, message: 'Please enter your password!'}]}
              >
                <Input.Password className="input" autoComplete="off" type="text" placeholder="Password"/>
              </Form.Item>

              {/* Again Password Input */}
              <Form.Item
                name='PasswordConfirmation'
                dependencies={['Password']}
                rules={[
                  {
                    required: true,
                    message: 'Please confirm your password!',
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('Password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('The passwords do not match!'));
                    },
                  }),
                ]}
              >
                <Input.Password className="input" autoComplete="off" type="text" placeholder="Confirm Password"/>
              </Form.Item>

               {/* Birth Date and Sex Row */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Form.Item
                  name='BirthDate'
                  rules={[{ required: true, message: 'Please select your birth date!' }]}
                  style={{ flex: 1, marginBottom: 0 }}
                >
                  <DatePicker 
                    className="input" 
                    placeholder="Birth Date" 
                    style={{ width: '100%' }} 
                    size="large"
                    disabledDate={disabledDate}
                    defaultPickerValue={dayjs().subtract(7, 'year')}
                  />
                </Form.Item>

                <Form.Item
                  name='Sex'
                  rules={[{ required: true, message: 'Please select your sex!' }]}
                  style={{ flex: 1, marginBottom: 0 }}
                >
                  <Select
                    className="input"
                    placeholder="Sex"
                    style={{ width: '100%' }}
                    size="large"
                    showArrow
                    options={[
                      { value: 'M', label: 'Male' },
                      { value: 'F', label: 'Female' },
                    ]}
                  />
                </Form.Item>
              </div>

              {/* Submit Button */}
            <button id="sign-up-button" onClick={handleSubmit}>Sign Up</button>                    
          </Form>
        </div>

    </div>
  )
}
export default SignUpForm